import { load } from "cheerio";
import {
  CitationConfidence,
  GapSeverity,
  IngestionStatus,
  JurisdictionType,
  OfficeLevel,
  RegionType,
  ReviewStatus,
  SourceType
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const CONNECTOR_KEY = "wv-house-roster";
const SOURCE_URL = "https://www.wvlegislature.gov/house/roster.cfm";

type ParsedMember = {
  name: string;
  party: string;
  districtCode: string;
  officeAddress: string | null;
  email: string | null;
  phone: string | null;
  detailUrl: string | null;
  photoUrl: string | null;
  sessionYear: number | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeDistrictCode(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits ? digits.padStart(3, "0") : raw.trim();
}

function oddYearForSession(sessionYear: number | null) {
  if (!sessionYear) {
    return null;
  }

  return sessionYear % 2 === 1 ? sessionYear : sessionYear - 1;
}

function inferredTermDates(sessionYear: number | null) {
  const oddYear = oddYearForSession(sessionYear);

  if (!oddYear) {
    return null;
  }

  return {
    startDate: new Date(`${oddYear}-01-01T00:00:00.000Z`),
    endDate: new Date(`${oddYear + 2}-01-01T00:00:00.000Z`)
  };
}

async function upsertGapFlag(input: {
  regionId?: string | null;
  entityType: string;
  entityId: string;
  fieldName?: string | null;
  severity: GapSeverity;
  reason: string;
}) {
  const existing = await prisma.dataGapFlag.findFirst({
    where: {
      entityType: input.entityType,
      entityId: input.entityId,
      fieldName: input.fieldName ?? null,
      reason: input.reason,
      reviewStatus: ReviewStatus.OPEN
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.dataGapFlag.create({
    data: {
      regionId: input.regionId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      fieldName: input.fieldName ?? null,
      severity: input.severity,
      reason: input.reason,
      reviewStatus: ReviewStatus.OPEN
    }
  });
}

async function parseRoster(): Promise<ParsedMember[]> {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "AccountabilityAppalachiaBot/0.1 (+https://accountabilityappalachia.local)"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch roster: ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);
  const members: ParsedMember[] = [];

  $("tr[valign='top']").each((_, element) => {
    const cells = $(element).find("td");

    if (cells.length < 6) {
      return;
    }

    const firstCell = $(cells[0]);
    const links = firstCell.find("a");
    const detailHref = links.last().attr("href") ?? links.first().attr("href") ?? null;
    const imageSrc = firstCell.find("img").attr("src") ?? null;
    const sessionYearMatch = imageSrc?.match(/\/(20\d{2})\/house\//);

    members.push({
      name: clean(links.last().text()),
      party: clean($(cells[1]).text()),
      districtCode: normalizeDistrictCode(clean($(cells[2]).text())),
      officeAddress: clean($(cells[3]).text()) || null,
      email: clean($(cells[4]).find("a").text()) || null,
      phone: clean($(cells[5]).text()) || null,
      detailUrl: detailHref ? new URL(detailHref, SOURCE_URL).toString() : null,
      photoUrl: imageSrc ? new URL(imageSrc, SOURCE_URL).toString() : null,
      sessionYear: sessionYearMatch ? Number(sessionYearMatch[1]) : null
    });
  });

  return members.filter((member) => member.name && member.districtCode);
}

export async function runWvHouseRosterSync() {
  const job = await prisma.dataIngestionJob.create({
    data: {
      connectorKey: CONNECTOR_KEY,
      status: IngestionStatus.RUNNING,
      startedAt: new Date()
    }
  });

  try {
    const members = await parseRoster();

    const existingSource = await prisma.source.findFirst({
      where: {
        url: SOURCE_URL
      }
    });

    const source = existingSource
      ? await prisma.source.update({
          where: { id: existingSource.id },
          data: {
            retrievedAt: new Date(),
            title: "House of Delegates Roster",
            publisher: "West Virginia Legislature",
            sourceType: SourceType.WEBSITE
          }
        })
      : await prisma.source.create({
          data: {
            title: "House of Delegates Roster",
            publisher: "West Virginia Legislature",
            url: SOURCE_URL,
            sourceType: SourceType.WEBSITE
          }
        });

    const stateRegion = await prisma.region.upsert({
      where: { slug: "west-virginia-statewide" },
      update: {
        name: "West Virginia Statewide",
        type: RegionType.STATE,
        stateCode: "WV",
        summary: "Statewide region created by official House roster connector."
      },
      create: {
        name: "West Virginia Statewide",
        slug: "west-virginia-statewide",
        type: RegionType.STATE,
        stateCode: "WV",
        summary: "Statewide region created by official House roster connector."
      }
    });

    const jurisdiction = await prisma.jurisdiction.upsert({
      where: { slug: "wv-house-of-delegates" },
        update: {
          name: "West Virginia House of Delegates",
        type: JurisdictionType.LEGISLATIVE,
          regionId: stateRegion.id
        },
        create: {
          regionId: stateRegion.id,
          name: "West Virginia House of Delegates",
          slug: "wv-house-of-delegates",
        type: JurisdictionType.LEGISLATIVE,
          summary: "Official state legislative chamber roster imported from the WV Legislature."
        }
      });

    const office = await prisma.office.upsert({
      where: { slug: "wv-state-delegate" },
      update: {
        jurisdictionId: jurisdiction.id,
        title: "State Delegate",
        level: OfficeLevel.STATE
      },
      create: {
        jurisdictionId: jurisdiction.id,
        title: "State Delegate",
        slug: "wv-state-delegate",
        level: OfficeLevel.STATE,
        districtLabel: "House district"
      }
    });

    let createdRepresentatives = 0;
    let updatedRepresentatives = 0;
    let openFlags = 0;

    for (const member of members) {
      const party = await prisma.party.upsert({
        where: { shortCode: slugify(member.party).toUpperCase().slice(0, 8) },
        update: {
          name: member.party
        },
        create: {
          name: member.party,
          shortCode: slugify(member.party).toUpperCase().slice(0, 8) || "UNK"
        }
      });

      const districtSlug = `wv-house-district-${member.districtCode}`;
      const district = await prisma.district.upsert({
        where: { slug: districtSlug },
        update: {
          regionId: stateRegion.id,
          jurisdictionId: jurisdiction.id,
          officeId: office.id,
          name: `District ${member.districtCode}`
        },
        create: {
          regionId: stateRegion.id,
          jurisdictionId: jurisdiction.id,
          officeId: office.id,
          name: `District ${member.districtCode}`,
          slug: districtSlug,
          districtCode: member.districtCode
        }
      });

      const slug = slugify(member.name);
      const existing = await prisma.representative.findUnique({
        where: { slug },
        include: {
          representativeTerms: {
            where: {
              isCurrent: true,
              officeId: office.id
            }
          }
        }
      });

      const representative = await prisma.representative.upsert({
        where: { slug },
        update: {
          fullName: member.name,
          partyId: party.id,
          photoUrl: member.photoUrl,
          websiteUrl: member.detailUrl,
          emailPublic: member.email,
          phonePublic: member.phone,
          officeAddress: member.officeAddress,
          lastVerifiedAt: new Date(),
          dataFreshnessCheckedAt: new Date()
        },
        create: {
          slug,
          fullName: member.name,
          partyId: party.id,
          photoUrl: member.photoUrl,
          websiteUrl: member.detailUrl,
          emailPublic: member.email,
          phonePublic: member.phone,
          officeAddress: member.officeAddress,
          profileStatus: "draft",
          lastVerifiedAt: new Date(),
          dataFreshnessCheckedAt: new Date()
        }
      });

      if (existing) {
        updatedRepresentatives += 1;
      } else {
        createdRepresentatives += 1;
      }

      await prisma.sourceCitation.deleteMany({
        where: {
          sourceId: source.id,
          targetTable: "Representative",
          targetId: representative.id,
          fieldName: "profile"
        }
      });

      await prisma.sourceCitation.create({
        data: {
          sourceId: source.id,
          targetTable: "Representative",
          targetId: representative.id,
          fieldName: "profile",
          citationLabel: "Official House roster",
          confidence: CitationConfidence.VERIFIED
        }
      });

      if (!member.email) {
        await upsertGapFlag({
          regionId: stateRegion.id,
          entityType: "Representative",
          entityId: representative.id,
          fieldName: "emailPublic",
          severity: GapSeverity.MEDIUM,
          reason: "Official roster did not expose a public email address."
        });
        openFlags += 1;
      }

      if (!member.phone) {
        await upsertGapFlag({
          regionId: stateRegion.id,
          entityType: "Representative",
          entityId: representative.id,
          fieldName: "phonePublic",
          severity: GapSeverity.MEDIUM,
          reason: "Official roster did not expose a public phone number."
        });
        openFlags += 1;
      }

      const currentDistrictHolder = await prisma.representativeTerm.findFirst({
        where: {
          officeId: office.id,
          districtId: district.id,
          isCurrent: true
        },
        include: {
          representative: true
        }
      });

      if (currentDistrictHolder && currentDistrictHolder.representativeId !== representative.id) {
        await upsertGapFlag({
          regionId: stateRegion.id,
          entityType: "RepresentativeTerm",
          entityId: currentDistrictHolder.id,
          fieldName: "district_assignment",
          severity: GapSeverity.HIGH,
          reason: `Official roster lists ${member.name} for District ${member.districtCode}, but the current published term belongs to ${currentDistrictHolder.representative.fullName}.`
        });
        openFlags += 1;
        continue;
      }

      const existingCurrentTerm = await prisma.representativeTerm.findFirst({
        where: {
          representativeId: representative.id,
          officeId: office.id,
          districtId: district.id,
          isCurrent: true
        }
      });

      if (!existingCurrentTerm) {
        const termDates = inferredTermDates(member.sessionYear);

        if (termDates) {
          const createdTerm = await prisma.representativeTerm.create({
            data: {
              representativeId: representative.id,
              officeId: office.id,
              districtId: district.id,
              startDate: termDates.startDate,
              endDate: termDates.endDate,
              isCurrent: true
            }
          });

          await upsertGapFlag({
            regionId: stateRegion.id,
            entityType: "RepresentativeTerm",
            entityId: createdTerm.id,
            fieldName: "term_dates",
            severity: GapSeverity.MEDIUM,
            reason:
              "Term dates were inferred from the official roster session year and should be reviewed before public publication."
          });
          openFlags += 1;
        } else {
          await upsertGapFlag({
            regionId: stateRegion.id,
            entityType: "Representative",
            entityId: representative.id,
            fieldName: "representativeTerms",
            severity: GapSeverity.HIGH,
            reason: "Official roster did not provide enough context to infer a current term date range."
          });
          openFlags += 1;
        }
      }
    }

    await prisma.dataIngestionJob.update({
      where: { id: job.id },
      data: {
        regionId: stateRegion.id,
        sourceId: source.id,
        status: openFlags ? IngestionStatus.COMPLETED_WITH_FLAGS : IngestionStatus.COMPLETED,
        completedAt: new Date(),
        recordsFetched: members.length,
        recordsChanged: createdRepresentatives + updatedRepresentatives,
        summaryJson: {
          createdRepresentatives,
          updatedRepresentatives,
          openFlags
        }
      }
    });

    return {
      ok: true,
      jobId: job.id,
      recordsFetched: members.length,
      createdRepresentatives,
      updatedRepresentatives,
      openFlags
    };
  } catch (error) {
    await prisma.dataIngestionJob.update({
      where: { id: job.id },
      data: {
        status: IngestionStatus.FAILED,
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown ingestion error"
      }
    });

    throw error;
  }
}

import {
  GapSeverity,
  MethodologyStatus,
  ModerationStatus,
  OfficeLevel,
  Prisma,
  QuestionStatus,
  ReviewStatus,
  ScoreType
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const representativeInclude = {
  party: true,
  committeeAssignments: {
    include: {
      committee: true
    }
  },
  issuePositions: {
    include: {
      issue: true
    },
    take: 4
  },
  promises: {
    take: 4
  },
  questions: {
    select: {
      responseStatus: true
    }
  },
  representativeTerms: {
    where: {
      isCurrent: true
    },
    take: 1,
    include: {
      office: {
        include: {
          jurisdiction: true
        }
      },
      district: true
    }
  },
  transparencyScores: {
    orderBy: {
      computedAt: "desc"
    }
  },
  satisfactionScores: {
    orderBy: {
      measuredAt: "desc"
    },
    take: 1
  },
  scoreInputs: {
    orderBy: {
      computedAt: "desc"
    }
  }
} satisfies Prisma.RepresentativeInclude;

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function latestScore(
  scores: Array<{ scoreType: ScoreType; scoreValue: Prisma.Decimal | null }>
    | undefined,
  scoreType: ScoreType
) {
  const value = scores?.find((score) => score.scoreType === scoreType)?.scoreValue;
  return value ? Number(value) : null;
}

function buildResponseStatus(statuses: QuestionStatus[]) {
  if (!statuses.length) {
    return "No published questions yet";
  }

  const answered = statuses.filter((status) => status === QuestionStatus.ANSWERED).length;
  return `Answered ${answered} of ${statuses.length} published questions`;
}

function getCurrentTerm(
  representative: Prisma.RepresentativeGetPayload<{ include: typeof representativeInclude }>
) {
  return representative.representativeTerms[0] ?? null;
}

function buildRepresentativeCard(
  representative: Prisma.RepresentativeGetPayload<{ include: typeof representativeInclude }>
) {
  const currentTerm = getCurrentTerm(representative);

  return {
    slug: representative.slug,
    name: representative.preferredName ?? representative.fullName,
    officeTitle: currentTerm?.office.title ?? "Office pending verification",
    jurisdiction: currentTerm?.office.jurisdiction.name ?? "Jurisdiction pending verification",
    district: currentTerm?.district?.name ?? "District pending verification",
    party: representative.party?.name ?? "Nonpartisan",
    photoInitials: (representative.preferredName ?? representative.fullName)
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    biography: representative.biography ?? "Biography pending publication.",
    committees: representative.committeeAssignments.map((item) => item.committee.name),
    contact: {
      phone: representative.phonePublic ?? "Not published",
      email: representative.emailPublic ?? "Not published",
      officeAddress: representative.officeAddress ?? "Not published",
      website: representative.websiteUrl ?? "Not published"
    },
    term: currentTerm
      ? `Current term: ${formatDate(currentTerm.startDate)} to ${currentTerm.endDate ? formatDate(currentTerm.endDate) : "Present"}`
      : "Current term pending verification",
    issueFocus: representative.issuePositions.map((item) => item.issue.name),
    promises: representative.promises.map((item) => item.title),
    responseStatus: buildResponseStatus(representative.questions.map((item) => item.responseStatus)),
    transparencyScore: latestScore(representative.transparencyScores, ScoreType.TRANSPARENCY),
    responsivenessScore: latestScore(representative.transparencyScores, ScoreType.RESPONSIVENESS),
    eventParticipationScore: latestScore(
      representative.transparencyScores,
      ScoreType.EVENT_PARTICIPATION
    ),
    satisfactionLabel:
      representative.satisfactionScores[0]?.summary ?? "Insufficient survey sample",
    lastUpdated: `Updated ${formatDate(representative.updatedAt)}`,
    sources: [],
    scoreBreakdown: representative.scoreInputs.map((item) => ({
      label: item.componentKey.replaceAll("_", " "),
      value: Number(item.componentValue),
      weight: 0,
      description: item.metadataJson && typeof item.metadataJson === "object" && "description" in item.metadataJson
        ? String(item.metadataJson.description)
        : "Methodology component stored for audit and explanation."
    }))
  };
}

function buildEventStatusLabel(status: string, representativeName?: string | null) {
  if (representativeName) {
    return `${representativeName}: ${status.toLowerCase().replaceAll("_", " ")}`;
  }

  return status.toLowerCase().replaceAll("_", " ");
}

export async function getHomePageData() {
  const [
    representativeRecords,
    eventRecords,
    regionRecords,
    representativeCount,
    pendingQuestionCount,
    reviewCount,
    surveyCount,
    eventCount
  ] =
    await Promise.all([
      prisma.representative.findMany({
        where: {
          profileStatus: "published"
        },
        include: representativeInclude,
        take: 2,
        orderBy: { updatedAt: "desc" }
      }),
      prisma.event.findMany({
        where: { isPublished: true },
        include: {
          region: true,
          invitations: {
            include: {
              representative: true
            }
          },
          _count: {
            select: {
              rsvps: true
            }
          }
        },
        orderBy: { startsAt: "asc" },
        take: 2
      }),
      getRegions(),
      prisma.representative.count({
        where: {
          profileStatus: "published"
        }
      }),
      prisma.constituentQuestion.count({
        where: {
          moderationStatus: ModerationStatus.PENDING
        }
      }),
      prisma.dataGapFlag.count({ where: { reviewStatus: ReviewStatus.OPEN } }),
      prisma.surveyResponse.count(),
      prisma.event.count({ where: { isPublished: true } })
    ]);

  return {
    representatives: representativeRecords.map(buildRepresentativeCard),
    events: eventRecords.map((event) => ({
      slug: event.slug,
      title: event.title,
      type: event.type.toLowerCase().replaceAll("_", " "),
      region: event.region.name,
      dateLabel: formatDate(event.startsAt),
      timeLabel: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }).format(event.startsAt),
      location: event.venueName ?? event.city ?? "Location pending publication",
      attendanceLabel: `${event._count.rsvps} RSVPs`,
      invitationStatus: event.invitations[0]
        ? buildEventStatusLabel(
            event.invitations[0].status,
            event.invitations[0].representative.preferredName ??
              event.invitations[0].representative.fullName
          )
        : "No invitations recorded",
      summary: event.summary ?? event.description ?? "Summary pending publication",
      focusAreas: []
    })),
    regions: regionRecords,
    siteStats: [
      { label: "Published representatives", value: String(representativeCount) },
      { label: "Upcoming civic events", value: String(eventCount) },
      { label: "Open survey responses", value: String(surveyCount) },
      { label: "Records awaiting review", value: String(reviewCount + pendingQuestionCount) }
    ]
  };
}

export async function searchRepresentatives(query?: string, officeLevel?: string) {
  const representativeRecords = await prisma.representative.findMany({
    where: {
      profileStatus: "published"
    },
    include: representativeInclude,
    orderBy: { fullName: "asc" }
  });

  return representativeRecords
    .filter((representative) => {
      const currentTerm = getCurrentTerm(representative);

      if (!officeLevel || officeLevel === "ALL") {
        return true;
      }

      return currentTerm?.office.level === officeLevel;
    })
    .map(buildRepresentativeCard)
    .filter((representative) => {
      const matchesQuery =
        !query ||
        [
          representative.name,
          representative.officeTitle,
          representative.jurisdiction,
          representative.district
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesOfficeLevel =
        !officeLevel || officeLevel === "ALL";

      return matchesQuery && matchesOfficeLevel;
    });
}

export async function getRepresentativeProfile(slug: string) {
  const representative = await prisma.representative.findUnique({
    where: { slug },
    include: representativeInclude
  });

  if (!representative || representative.profileStatus !== "published") {
    return null;
  }

  const citations = await prisma.sourceCitation.findMany({
    where: {
      targetTable: "Representative",
      targetId: representative.id
    },
    include: {
      source: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const mapped = buildRepresentativeCard(representative);

  return {
    ...mapped,
    sources: citations.map((citation) => ({
      label: citation.citationLabel ?? citation.source.title,
      publisher: citation.source.publisher ?? "Verified source",
      updatedLabel: `Retrieved ${formatDate(citation.source.retrievedAt)}`
    })),
    scoreBreakdown: representative.scoreInputs
      .filter((item) => item.scoreType === ScoreType.TRANSPARENCY)
      .map((item) => ({
        label: item.componentKey.replaceAll("_", " "),
        value: Number(item.componentValue),
        weight:
          item.metadataJson && typeof item.metadataJson === "object" && "weight" in item.metadataJson
            ? Number(item.metadataJson.weight)
            : 0,
        description:
          item.metadataJson && typeof item.metadataJson === "object" && "description" in item.metadataJson
            ? String(item.metadataJson.description)
            : "Methodology component stored for audit and explanation."
      }))
  };
}

export async function getRepresentativeOptions() {
  const representatives = await prisma.representative.findMany({
    where: {
      profileStatus: "published"
    },
    orderBy: { fullName: "asc" },
    select: {
      slug: true,
      fullName: true,
      preferredName: true
    }
  });

  return representatives.map((representative) => ({
    slug: representative.slug,
    label: representative.preferredName ?? representative.fullName
  }));
}

export async function getEvents() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      region: true,
      invitations: {
        include: {
          representative: true
        }
      },
      _count: {
        select: {
          rsvps: true
        }
      }
    },
    orderBy: { startsAt: "asc" }
  });

  return events.map((event) => ({
    slug: event.slug,
    title: event.title,
    type: event.type.toLowerCase().replaceAll("_", " "),
    region: event.region.name,
    dateLabel: formatDate(event.startsAt),
    timeLabel: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(event.startsAt),
    location: event.venueName ?? event.city ?? "Location pending publication",
    attendanceLabel: `${event._count.rsvps} RSVPs`,
    invitationStatus: event.invitations[0]
      ? buildEventStatusLabel(
          event.invitations[0].status,
          event.invitations[0].representative.preferredName ??
            event.invitations[0].representative.fullName
        )
      : "No invitations recorded",
    summary: event.summary ?? event.description ?? "Summary pending publication",
    focusAreas: []
  }));
}

export async function getEventDetail(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      region: true,
      invitations: {
        include: {
          representative: true
        }
      },
      _count: {
        select: {
          rsvps: true,
          questions: true
        }
      }
    }
  });

  if (!event) {
    return null;
  }

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    type: event.type.toLowerCase().replaceAll("_", " "),
    region: event.region.name,
    dateLabel: formatDate(event.startsAt),
    timeLabel: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(event.startsAt),
    location:
      [event.venueName, event.streetAddress, event.city, event.stateCode].filter(Boolean).join(", ") ||
      "Location pending publication",
    attendanceLabel: `${event._count.rsvps} RSVPs`,
    invitationStatus: event.invitations.length
      ? event.invitations.map((item) =>
          buildEventStatusLabel(
            item.status,
            item.representative.preferredName ?? item.representative.fullName
          )
        )
      : ["No invitations recorded"],
    summary: event.summary ?? event.description ?? "Summary pending publication",
    focusAreas: [],
    questionCount: event._count.questions
  };
}

export async function getMethodologyCards() {
  const methodologys = await prisma.scoreMethodology.findMany({
    where: {
      status: MethodologyStatus.ACTIVE
    },
    orderBy: [
      { key: "asc" },
      { version: "desc" }
    ]
  });

  return methodologys.map((item) => ({
    title: item.title,
    summary: item.description ?? "Methodology description pending publication.",
    version: `Version ${item.version}`,
    evidencePolicy:
      item.rulesJson && typeof item.rulesJson === "object" && "evidencePolicy" in item.rulesJson
        ? String(item.rulesJson.evidencePolicy)
        : "Verified public records are weighted separately from opinion signals."
  }));
}

export async function getSurveys() {
  return prisma.survey.findMany({
    where: {
      status: {
        in: ["ACTIVE", "SCHEDULED"]
      }
    },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getRegions() {
  const [regions, currentTerms, events, surveys] = await Promise.all([
    prisma.region.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.representativeTerm.findMany({
      where: { isCurrent: true },
      include: {
        district: true
      }
    }),
    prisma.event.findMany({
      where: { isPublished: true },
      select: {
        regionId: true
      }
    }),
    prisma.survey.findMany({
      where: {
        status: {
          in: ["ACTIVE", "SCHEDULED"]
        }
      },
      select: {
        regionId: true,
        title: true
      }
    })
  ]);

  return regions.map((region) => ({
    slug: region.slug,
    name: region.name,
    state: region.stateCode ?? "Regional pilot",
    description: region.summary ?? "Regional summary pending publication.",
    priorities: surveys.filter((survey) => survey.regionId === region.id).map((survey) => survey.title),
    eventCount: events.filter((event) => event.regionId === region.id).length,
    representativeCount: currentTerms.filter((term) => term.district?.regionId === region.id).length
  }));
}

export async function getRegionDetail(slug: string) {
  const region = await prisma.region.findUnique({
    where: { slug }
  });

  if (!region) {
    return null;
  }

  const [events, currentTerms, surveys] = await Promise.all([
    prisma.event.findMany({
      where: { regionId: region.id, isPublished: true },
      orderBy: { startsAt: "asc" }
    }),
    prisma.representativeTerm.findMany({
      where: {
        isCurrent: true,
        district: {
          regionId: region.id
        }
      }
    }),
    prisma.survey.findMany({
      where: {
        regionId: region.id
      }
    })
  ]);

  return {
    slug: region.slug,
    name: region.name,
    state: region.stateCode ?? "Regional pilot",
    description: region.summary ?? "Regional summary pending publication.",
    priorities: surveys.map((survey) => survey.title),
    eventCount: events.length,
    representativeCount: currentTerms.length,
    events: events.map((event) => ({
      slug: event.slug,
      title: event.title,
      type: event.type.toLowerCase().replaceAll("_", " "),
      dateLabel: formatDate(event.startsAt),
      location: event.venueName ?? event.city ?? "Location pending publication"
    }))
  };
}

export async function getTransparencyOverview() {
  const [regions, representatives] = await Promise.all([getRegions(), searchRepresentatives()]);

  return { regions, representatives };
}

export async function getAdminDashboard() {
  const [openGapFlags, pendingQuestions, methodologyDrafts, pendingEvents, ingestionJobs, draftRepresentatives] = await Promise.all([
    prisma.dataGapFlag.count({
      where: { reviewStatus: ReviewStatus.OPEN }
    }),
    prisma.constituentQuestion.count({
      where: { moderationStatus: ModerationStatus.PENDING }
    }),
    prisma.scoreMethodology.count({
      where: { status: "DRAFT" }
    }),
    prisma.event.count({
      where: { isPublished: false }
    }),
    prisma.dataIngestionJob.count(),
    prisma.representative.count({
      where: {
        profileStatus: "draft"
      }
    })
  ]);

  return {
    openReviewItems: openGapFlags + pendingQuestions + draftRepresentatives,
    pendingEventApprovals: pendingEvents,
    methodologyDrafts,
    ingestionJobs,
    draftRepresentatives
  };
}

export async function getRecentIngestionJobs() {
  return prisma.dataIngestionJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      source: true,
      region: true
    }
  });
}

export async function getAdminDashboardSummary() {
  const [dashboard, jobs] = await Promise.all([
    getAdminDashboard(),
    getRecentIngestionJobs()
  ]);

  return {
    ...dashboard,
    jobs
  };
}

export async function getReviewQueue() {
  const [gapFlags, pendingQuestions, draftRepresentatives] = await Promise.all([
    prisma.dataGapFlag.findMany({
      where: { reviewStatus: ReviewStatus.OPEN },
      orderBy: { detectedAt: "desc" }
    }),
    prisma.constituentQuestion.findMany({
      where: { moderationStatus: ModerationStatus.PENDING },
      include: {
        representative: true,
        event: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.representative.findMany({
      where: { profileStatus: "draft" },
      include: {
        party: true,
        representativeTerms: {
          where: { isCurrent: true },
          include: {
            office: true,
            district: true
          },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const currentTermIds = draftRepresentatives
    .flatMap((representative) => representative.representativeTerms.map((term) => term.id));
  const representativeIds = draftRepresentatives.map((representative) => representative.id);

  const [draftFlags, citations] =
    representativeIds.length || currentTermIds.length
      ? await Promise.all([
          prisma.dataGapFlag.findMany({
            where: {
              reviewStatus: ReviewStatus.OPEN,
              OR: [
                ...(representativeIds.length
                  ? [
                      {
                        entityType: "Representative",
                        entityId: {
                          in: representativeIds
                        }
                      }
                    ]
                  : []),
                ...(currentTermIds.length
                  ? [
                      {
                        entityType: "RepresentativeTerm",
                        entityId: {
                          in: currentTermIds
                        }
                      }
                    ]
                  : [])
              ]
            }
          }),
          prisma.sourceCitation.findMany({
            where: {
              targetTable: "Representative",
              targetId: {
                in: representativeIds
              }
            },
            select: {
              targetId: true
            }
          })
        ])
      : [[], []];

  const termToRepresentative = new Map(
    draftRepresentatives.flatMap((representative) =>
      representative.representativeTerms.map((term) => [term.id, representative.id] as const)
    )
  );

  const flagsByRepresentative = new Map<string, typeof draftFlags>();

  for (const flag of draftFlags) {
    const ownerId =
      flag.entityType === "Representative"
        ? flag.entityId
        : flag.entityType === "RepresentativeTerm"
          ? termToRepresentative.get(flag.entityId)
          : null;

    if (!ownerId) {
      continue;
    }

    const existingFlags = flagsByRepresentative.get(ownerId) ?? [];
    existingFlags.push(flag);
    flagsByRepresentative.set(ownerId, existingFlags);
  }

  const citationCounts = new Map<string, number>();

  for (const citation of citations) {
    citationCounts.set(citation.targetId, (citationCounts.get(citation.targetId) ?? 0) + 1);
  }

  return {
    draftRepresentatives: draftRepresentatives.map((item) => {
      const currentTerm = item.representativeTerms[0];
      const openFlags = flagsByRepresentative.get(item.id) ?? [];
      const blockingFlags = openFlags.filter(
        (flag) => flag.severity === GapSeverity.HIGH || flag.severity === GapSeverity.CRITICAL
      );
      const citationCount = citationCounts.get(item.id) ?? 0;
      const canPublish = Boolean(currentTerm) && citationCount > 0 && blockingFlags.length === 0;

      return {
        id: item.id,
        slug: item.slug,
        name: item.preferredName ?? item.fullName,
        party: item.party?.name ?? "Nonpartisan",
        officeTitle: currentTerm?.office.title ?? "Office pending verification",
        district: currentTerm?.district?.name ?? "District pending verification",
        websiteUrl: item.websiteUrl,
        emailPublic: item.emailPublic,
        phonePublic: item.phonePublic,
        updatedLabel: `Updated ${formatDate(item.updatedAt)}`,
        openFlagCount: openFlags.length,
        blockingFlagCount: blockingFlags.length,
        citationCount,
        canPublish,
        publishReason: !currentTerm
          ? "Current term is missing. Review the district assignment before publication."
          : citationCount === 0
            ? "At least one representative citation is required before publication."
            : blockingFlags.length
              ? "Resolve all high-severity review flags before publication."
              : "Ready for publication."
      };
    }),
    gapFlags: gapFlags.map((item) => ({
      id: item.id,
      entity: item.entityType,
      status: item.severity,
      detail: item.reason,
      fieldName: item.fieldName
    })),
    pendingQuestions: pendingQuestions.map((item) => ({
      id: item.id,
      entity: "Constituent question",
      status: item.moderationStatus,
      detail: item.questionText,
      context:
        item.event?.title ??
        item.representative?.preferredName ??
        item.representative?.fullName ??
        "General question"
    }))
  };
}

export async function getQuestionStatusSummary(questionId: string) {
  return prisma.constituentQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      moderationStatus: true,
      responseStatus: true,
      createdAt: true
    }
  });
}

export function officeLevelOptions() {
  return [
    { label: "All offices", value: "ALL" },
    { label: "Local", value: OfficeLevel.LOCAL },
    { label: "County", value: OfficeLevel.COUNTY },
    { label: "State", value: OfficeLevel.STATE }
  ];
}

export function severityLabel(severity: GapSeverity) {
  return severity.toLowerCase();
}

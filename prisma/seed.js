const {
  PrismaClient,
  CitationConfidence,
  EventType,
  GapSeverity,
  InvitationStatus,
  MethodologyStatus,
  ModerationStatus,
  OfficeLevel,
  QuestionStatus,
  RegionType,
  ReviewStatus,
  RoleKey,
  SatisfactionSentiment,
  ScoreType,
  SourceType,
  SurveyQuestionType,
  SurveyStatus,
  UserStatus,
  VisibilityScope
} = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.dataOverride.deleteMany();
  await prisma.dataGapFlag.deleteMany();
  await prisma.dataIngestionJob.deleteMany();
  await prisma.sourceCitation.deleteMany();
  await prisma.source.deleteMany();
  await prisma.surveyAnswer.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.surveyQuestion.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.satisfactionScore.deleteMany();
  await prisma.transparencyScore.deleteMany();
  await prisma.scoreInput.deleteMany();
  await prisma.scoreMethodology.deleteMany();
  await prisma.response.deleteMany();
  await prisma.constituentQuestion.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.eventInvitation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.promiseCommitment.deleteMany();
  await prisma.issuePosition.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.billSponsorship.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.committeeAssignment.deleteMany();
  await prisma.committee.deleteMany();
  await prisma.representativeTerm.deleteMany();
  await prisma.representative.deleteMany();
  await prisma.office.deleteMany();
  await prisma.district.deleteMany();
  await prisma.jurisdiction.deleteMany();
  await prisma.party.deleteMany();
  await prisma.outreachCampaign.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.region.deleteMany();
}

async function main() {
  await clearDatabase();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@accountabilityappalachia.local";

  const adminRole = await prisma.role.create({
    data: {
      key: RoleKey.ADMIN,
      label: "Admin",
      description: "Platform administrator"
    }
  });

  await prisma.role.create({
    data: {
      key: RoleKey.ORGANIZER,
      label: "Organizer",
      description: "Community organizer"
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      displayName: "Pilot Administrator",
      status: UserStatus.ACTIVE
    }
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  const regionA = await prisma.region.create({
    data: {
      name: "Kanawha Valley Pilot Region",
      slug: "kanawha-valley",
      type: RegionType.COUNTY,
      stateCode: "WV",
      summary:
        "Pilot coverage focused on county and state offices, public meetings, and issue priorities submitted by residents."
    }
  });

  const regionB = await prisma.region.create({
    data: {
      name: "Southwest Virginia Highlands",
      slug: "southwest-virginia-highlands",
      type: RegionType.SERVICE_AREA,
      stateCode: "VA",
      summary:
        "Expansion-ready regional coverage across multiple mountain communities and office types."
    }
  });

  const stateJurisdiction = await prisma.jurisdiction.create({
    data: {
      regionId: regionA.id,
      name: "West Virginia House of Delegates",
      slug: "wv-house-delegates",
      type: "LEGISLATIVE",
      summary: "State legislative chamber for delegate districts in the pilot."
    }
  });

  const countyJurisdiction = await prisma.jurisdiction.create({
    data: {
      regionId: regionA.id,
      name: "Kanawha County Commission",
      slug: "kanawha-county-commission",
      type: "COUNTY",
      summary: "County executive and administrative body."
    }
  });

  const districtOffice = await prisma.office.create({
    data: {
      jurisdictionId: stateJurisdiction.id,
      title: "State Delegate",
      slug: "state-delegate",
      level: OfficeLevel.STATE,
      districtLabel: "House district"
    }
  });

  const countyOffice = await prisma.office.create({
    data: {
      jurisdictionId: countyJurisdiction.id,
      title: "County Commissioner",
      slug: "county-commissioner",
      level: OfficeLevel.COUNTY,
      districtLabel: "Commission seat"
    }
  });

  const district41 = await prisma.district.create({
    data: {
      regionId: regionA.id,
      jurisdictionId: stateJurisdiction.id,
      officeId: districtOffice.id,
      name: "District 41",
      slug: "district-41",
      districtCode: "41"
    }
  });

  const atLarge = await prisma.district.create({
    data: {
      regionId: regionA.id,
      jurisdictionId: countyJurisdiction.id,
      officeId: countyOffice.id,
      name: "At-large",
      slug: "kanawha-at-large",
      districtCode: "AL"
    }
  });

  const independentParty = await prisma.party.create({
    data: {
      name: "Independent",
      shortCode: "IND",
      colorHex: "#5C6B73"
    }
  });

  const nonpartisanParty = await prisma.party.create({
    data: {
      name: "Nonpartisan",
      shortCode: "NON",
      colorHex: "#8B8C89"
    }
  });

  const jordanEllis = await prisma.representative.create({
    data: {
      slug: "jordan-ellis",
      fullName: "Jordan Ellis",
      biography:
        "Jordan Ellis represents District 41 and focuses on constituent office hours, transportation reliability, and transparent district reporting.",
      partyId: independentParty.id,
      websiteUrl: "https://delegate-ellis.example.gov",
      emailPublic: "jellis@example.gov",
      phonePublic: "(304) 555-0142",
      officeAddress: "1900 Kanawha Blvd E, Charleston, WV",
      profileStatus: "published",
      lastVerifiedAt: new Date("2026-03-15T12:00:00Z"),
      dataFreshnessCheckedAt: new Date("2026-03-15T12:00:00Z")
    }
  });

  const marinaHolt = await prisma.representative.create({
    data: {
      slug: "marina-holt",
      fullName: "Marina Holt",
      biography:
        "Marina Holt serves county-wide and focuses on budgeting visibility, emergency preparedness, and resident communication around infrastructure projects.",
      partyId: nonpartisanParty.id,
      websiteUrl: "https://kanawha.example.gov/commission/holt",
      emailPublic: "mholt@kanawha.example.gov",
      phonePublic: "(304) 555-0187",
      officeAddress: "407 Virginia St E, Charleston, WV",
      profileStatus: "published",
      lastVerifiedAt: new Date("2026-03-12T12:00:00Z"),
      dataFreshnessCheckedAt: new Date("2026-03-12T12:00:00Z")
    }
  });

  await prisma.representativeTerm.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        officeId: districtOffice.id,
        districtId: district41.id,
        startDate: new Date("2025-01-08T00:00:00Z"),
        endDate: new Date("2027-01-10T00:00:00Z"),
        isCurrent: true
      },
      {
        representativeId: marinaHolt.id,
        officeId: countyOffice.id,
        districtId: atLarge.id,
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2028-12-31T00:00:00Z"),
        isCurrent: true
      }
    ]
  });

  const transportationCommittee = await prisma.committee.create({
    data: {
      jurisdictionId: stateJurisdiction.id,
      name: "Transportation Committee",
      slug: "transportation-committee"
    }
  });

  const budgetCommittee = await prisma.committee.create({
    data: {
      jurisdictionId: countyJurisdiction.id,
      name: "Budget Review Committee",
      slug: "budget-review-committee"
    }
  });

  await prisma.committeeAssignment.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        committeeId: transportationCommittee.id,
        roleTitle: "Member"
      },
      {
        representativeId: marinaHolt.id,
        committeeId: budgetCommittee.id,
        roleTitle: "Chair"
      }
    ]
  });

  const issues = await Promise.all(
    [
      ["road-safety", "Road safety"],
      ["flood-resilience", "Flood resilience"],
      ["rural-health", "Rural health staffing"],
      ["budget-transparency", "Budget transparency"],
      ["emergency-alerts", "Emergency alerts"]
    ].map(([slug, name]) =>
      prisma.issue.create({
        data: {
          slug,
          name
        }
      })
    )
  );

  const issueMap = Object.fromEntries(issues.map((issue) => [issue.slug, issue]));

  await prisma.issuePosition.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        issueId: issueMap["road-safety"].id,
        positionLabel: "Supports increased rural road repair funding",
        summary: "Verified from legislative profile and town hall remarks",
        evidenceType: "verified_public_record",
        confidenceLabel: "verified"
      },
      {
        representativeId: jordanEllis.id,
        issueId: issueMap["flood-resilience"].id,
        positionLabel: "Supports district flood planning investment",
        summary: "Verified from district office updates",
        evidenceType: "verified_public_record",
        confidenceLabel: "verified"
      },
      {
        representativeId: marinaHolt.id,
        issueId: issueMap["budget-transparency"].id,
        positionLabel: "Supports budget transparency reforms",
        summary: "Verified from county commission page",
        evidenceType: "verified_public_record",
        confidenceLabel: "verified"
      },
      {
        representativeId: marinaHolt.id,
        issueId: issueMap["emergency-alerts"].id,
        positionLabel: "Supports expanding emergency communications",
        summary: "Verified from county emergency preparedness briefing",
        evidenceType: "verified_public_record",
        confidenceLabel: "verified"
      }
    ]
  });

  await prisma.promiseCommitment.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        title: "Publish quarterly district updates",
        summary: "Public promise on district communications"
      },
      {
        representativeId: jordanEllis.id,
        title: "Hold one public town hall in each county served per quarter",
        summary: "Commitment to recurring constituent events"
      },
      {
        representativeId: marinaHolt.id,
        title: "Publish meeting summaries within five business days",
        summary: "Commitment to faster public reporting"
      }
    ]
  });

  const ellisSource = await prisma.source.create({
    data: {
      regionId: regionA.id,
      sourceType: SourceType.WEBSITE,
      title: "Official House profile",
      publisher: "West Virginia Legislature",
      url: "https://legis.example/wv/ellis"
    }
  });

  const holtSource = await prisma.source.create({
    data: {
      regionId: regionA.id,
      sourceType: SourceType.WEBSITE,
      title: "County commission page",
      publisher: "Kanawha County",
      url: "https://kanawha.example.gov/commission/holt"
    }
  });

  await prisma.sourceCitation.createMany({
    data: [
      {
        sourceId: ellisSource.id,
        targetTable: "Representative",
        targetId: jordanEllis.id,
        fieldName: "profile",
        citationLabel: "Official House profile",
        confidence: CitationConfidence.VERIFIED,
        verifiedByUserId: adminUser.id,
        verifiedAt: new Date("2026-03-15T12:00:00Z")
      },
      {
        sourceId: holtSource.id,
        targetTable: "Representative",
        targetId: marinaHolt.id,
        fieldName: "profile",
        citationLabel: "County commission page",
        confidence: CitationConfidence.VERIFIED,
        verifiedByUserId: adminUser.id,
        verifiedAt: new Date("2026-03-12T12:00:00Z")
      }
    ]
  });

  const transparencyMethodology = await prisma.scoreMethodology.create({
    data: {
      key: "transparency",
      version: 1,
      title: "Transparency score",
      description:
        "Combines public information completeness, source freshness, contact openness, and issue-position coverage.",
      status: MethodologyStatus.ACTIVE,
      weightsJson: {
        public_information_completeness: 0.3,
        response_timeliness: 0.3,
        event_participation: 0.2,
        source_freshness: 0.2
      },
      rulesJson: {
        evidencePolicy:
          "Only verified public records contribute to completeness and freshness inputs. Opinion data is stored separately."
      }
    }
  });

  const responsivenessMethodology = await prisma.scoreMethodology.create({
    data: {
      key: "responsiveness",
      version: 1,
      title: "Responsiveness score",
      description: "Measures official response timeliness and completion rate for moderated questions.",
      status: MethodologyStatus.ACTIVE,
      weightsJson: {
        response_completion_rate: 0.5,
        response_timeliness: 0.5
      },
      rulesJson: {
        evidencePolicy:
          "User satisfaction does not alter responsiveness calculations and is published separately."
      }
    }
  });

  const participationMethodology = await prisma.scoreMethodology.create({
    data: {
      key: "participation",
      version: 1,
      title: "Participation score",
      description:
        "Measures invitation response rate, accepted appearances, and recorded attendance at public-facing events.",
      status: MethodologyStatus.ACTIVE,
      weightsJson: {
        invitation_response_rate: 0.4,
        attendance_consistency: 0.6
      },
      rulesJson: {
        evidencePolicy: "Declined events remain visible and are not treated as no-response."
      }
    }
  });

  await prisma.scoreInput.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "public_information_completeness",
        componentValue: 88,
        metadataJson: {
          weight: 0.3,
          description: "Measures whether profile, contact channels, and office details are public and current."
        }
      },
      {
        representativeId: jordanEllis.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "response_timeliness",
        componentValue: 74,
        metadataJson: {
          weight: 0.3,
          description: "Measures the median speed of official responses to moderated questions."
        }
      },
      {
        representativeId: jordanEllis.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "event_participation",
        componentValue: 79,
        metadataJson: {
          weight: 0.2,
          description: "Measures accepted invitations and recorded attendance at public events."
        }
      },
      {
        representativeId: jordanEllis.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "source_freshness",
        componentValue: 80,
        metadataJson: {
          weight: 0.2,
          description: "Measures whether key public fields were verified recently."
        }
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "public_information_completeness",
        componentValue: 84,
        metadataJson: {
          weight: 0.35,
          description: "Most contact and office data is public and easy to verify."
        }
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "response_timeliness",
        componentValue: 41,
        metadataJson: {
          weight: 0.35,
          description: "Few recent official responses were recorded in the platform review window."
        }
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "event_participation",
        componentValue: 58,
        metadataJson: {
          weight: 0.15,
          description: "Attendance is inconsistent across invited events."
        }
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        componentKey: "source_freshness",
        componentValue: 71,
        metadataJson: {
          weight: 0.15,
          description: "Key details are public, but several fields need re-verification."
        }
      }
    ]
  });

  await prisma.transparencyScore.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        scoreValue: 82,
        scoreBand: "strong",
        summary: "Public information is comparatively complete and recently verified."
      },
      {
        representativeId: jordanEllis.id,
        methodologyId: responsivenessMethodology.id,
        scoreType: ScoreType.RESPONSIVENESS,
        scoreValue: 74,
        scoreBand: "moderate",
        summary: "Response rate is above the current pilot average."
      },
      {
        representativeId: jordanEllis.id,
        methodologyId: participationMethodology.id,
        scoreType: ScoreType.EVENT_PARTICIPATION,
        scoreValue: 79,
        scoreBand: "strong",
        summary: "Attendance and invite response are consistent."
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: transparencyMethodology.id,
        scoreType: ScoreType.TRANSPARENCY,
        scoreValue: 69,
        scoreBand: "moderate",
        summary: "Core public details are available, but response-related evidence is weaker."
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: responsivenessMethodology.id,
        scoreType: ScoreType.RESPONSIVENESS,
        scoreValue: 41,
        scoreBand: "limited",
        summary: "Few recent official responses have been recorded."
      },
      {
        representativeId: marinaHolt.id,
        methodologyId: participationMethodology.id,
        scoreType: ScoreType.EVENT_PARTICIPATION,
        scoreValue: 58,
        scoreBand: "moderate",
        summary: "Participation is mixed across public event invitations."
      }
    ]
  });

  await prisma.satisfactionScore.createMany({
    data: [
      {
        representativeId: jordanEllis.id,
        regionId: regionA.id,
        methodologyId: transparencyMethodology.id,
        sampleSize: 38,
        scoreValue: 63,
        sentiment: SatisfactionSentiment.MIXED,
        summary: "Mixed but improving"
      },
      {
        representativeId: marinaHolt.id,
        regionId: regionA.id,
        methodologyId: transparencyMethodology.id,
        sampleSize: 8,
        scoreValue: null,
        sentiment: SatisfactionSentiment.INSUFFICIENT_DATA,
        summary: "Insufficient survey sample"
      }
    ]
  });

  const springTownHall = await prisma.event.create({
    data: {
      regionId: regionA.id,
      jurisdictionId: stateJurisdiction.id,
      slug: "spring-town-hall-transit-safety",
      title: "Spring Town Hall on Transit and Road Safety",
      type: EventType.TOWN_HALL,
      description:
        "A public forum focused on transportation reliability, school bus delays, and road maintenance priorities.",
      venueName: "Charleston Civic Center",
      city: "Charleston",
      stateCode: "WV",
      startsAt: new Date("2026-04-09T22:00:00Z"),
      endsAt: new Date("2026-04-09T23:30:00Z"),
      summary:
        "Residents can submit questions in advance and inspect which invited representatives accepted attendance.",
      isPublished: true
    }
  });

  const floodOfficeHours = await prisma.event.create({
    data: {
      regionId: regionA.id,
      jurisdictionId: countyJurisdiction.id,
      slug: "county-office-hours-flood-preparedness",
      title: "County Office Hours on Flood Preparedness",
      type: EventType.OFFICE_HOURS,
      description:
        "Drop-in conversations about neighborhood flood planning and emergency communications.",
      venueName: "East End Community Center",
      city: "Charleston",
      stateCode: "WV",
      startsAt: new Date("2026-04-16T21:30:00Z"),
      endsAt: new Date("2026-04-16T23:00:00Z"),
      summary:
        "Residents can ask practical questions about emergency alerts, drainage planning, and county response coordination.",
      isPublished: true
    }
  });

  await prisma.eventInvitation.createMany({
    data: [
      {
        eventId: springTownHall.id,
        representativeId: jordanEllis.id,
        status: InvitationStatus.ACCEPTED,
        respondedAt: new Date("2026-03-18T18:00:00Z")
      },
      {
        eventId: floodOfficeHours.id,
        representativeId: marinaHolt.id,
        status: InvitationStatus.NO_RESPONSE
      }
    ]
  });

  await prisma.rSVP.createMany({
    data: [
      {
        eventId: springTownHall.id,
        guestName: "Pilot Resident",
        guestEmail: "resident@example.com"
      },
      {
        eventId: springTownHall.id,
        guestName: "Transit Parent",
        guestEmail: "parent@example.com"
      }
    ]
  });

  const survey = await prisma.survey.create({
    data: {
      regionId: regionA.id,
      slug: "spring-issue-priorities",
      title: "Spring Issue Priorities",
      description: "A short survey on the most urgent local and state issues in the region.",
      purposeStatement:
        "Collect the issues residents want local and state officials to prioritize before the summer legislative and budget cycle.",
      status: SurveyStatus.ACTIVE,
      visibilityScope: VisibilityScope.PUBLIC,
      requiresConsent: true,
      opensAt: new Date("2026-03-01T00:00:00Z"),
      closesAt: new Date("2026-05-31T23:59:59Z")
    }
  });

  const surveyQuestions = await prisma.$transaction([
    prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        issueId: issueMap["road-safety"].id,
        prompt: "Which issue feels most urgent in your community?",
        questionType: SurveyQuestionType.SHORT_TEXT,
        displayOrder: 1,
        isRequired: true
      }
    }),
    prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        issueId: issueMap["budget-transparency"].id,
        prompt: "How do you prefer to hear from public officials?",
        questionType: SurveyQuestionType.SHORT_TEXT,
        displayOrder: 2,
        isRequired: true
      }
    }),
    prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        issueId: issueMap["emergency-alerts"].id,
        prompt: "How satisfied are you with access to local civic events?",
        questionType: SurveyQuestionType.SHORT_TEXT,
        displayOrder: 3,
        isRequired: true
      }
    })
  ]);

  const seededResponse = await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      regionId: regionA.id,
      consentedAt: new Date(),
      visibilityScope: VisibilityScope.RESTRICTED,
      respondentHash: "seeded-aggregate-only"
    }
  });

  await prisma.surveyAnswer.createMany({
    data: [
      {
        surveyResponseId: seededResponse.id,
        surveyQuestionId: surveyQuestions[0].id,
        answerText: "Road safety"
      },
      {
        surveyResponseId: seededResponse.id,
        surveyQuestionId: surveyQuestions[1].id,
        answerText: "Text alerts and short email updates"
      },
      {
        surveyResponseId: seededResponse.id,
        surveyQuestionId: surveyQuestions[2].id,
        answerText: "Moderately satisfied"
      }
    ]
  });

  const pendingQuestion = await prisma.constituentQuestion.create({
    data: {
      regionId: regionA.id,
      representativeId: jordanEllis.id,
      eventId: springTownHall.id,
      submittedName: "Casey Walker",
      submittedEmail: "casey@example.com",
      topicLabel: "Road maintenance",
      questionText:
        "Will District 41 publish a quarterly road maintenance update with project timelines and safety priorities?",
      moderationStatus: ModerationStatus.PENDING,
      responseStatus: QuestionStatus.PENDING
    }
  });

  const approvedQuestion = await prisma.constituentQuestion.create({
    data: {
      regionId: regionA.id,
      representativeId: jordanEllis.id,
      submittedName: "Taylor Green",
      submittedEmail: "taylor@example.com",
      topicLabel: "District communication",
      questionText: "How often will the office publish district updates this year?",
      moderationStatus: ModerationStatus.APPROVED,
      responseStatus: QuestionStatus.ANSWERED
    }
  });

  await prisma.response.create({
    data: {
      questionId: approvedQuestion.id,
      representativeId: jordanEllis.id,
      body: "The office plans to publish one district update each quarter and post event recaps within one week.",
      isOfficial: true,
      status: "PUBLISHED",
      respondedAt: new Date("2026-03-10T12:00:00Z")
    }
  });

  await prisma.dataGapFlag.createMany({
    data: [
      {
        regionId: regionA.id,
        entityType: "RepresentativeTerm",
        entityId: pendingQuestion.id,
        fieldName: "term verification",
        severity: GapSeverity.HIGH,
        reason: "Detected officeholder change for House District 41 from official source feed.",
        reviewStatus: ReviewStatus.OPEN
      },
      {
        regionId: regionA.id,
        entityType: "IssuePosition",
        entityId: marinaHolt.id,
        fieldName: "broadband stance",
        severity: GapSeverity.MEDIUM,
        reason: "Connector inferred a broadband stance from a public speech transcript and requires reviewer confirmation.",
        reviewStatus: ReviewStatus.OPEN
      }
    ]
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export type ScoreBreakdownItem = {
  label: string;
  value: number | null;
  weight: number;
  description: string;
};

export type SourceReference = {
  label: string;
  publisher: string;
  updatedLabel: string;
};

export type Representative = {
  slug: string;
  name: string;
  officeTitle: string;
  jurisdiction: string;
  district: string;
  party: string;
  photoInitials: string;
  biography: string;
  committees: string[];
  contact: {
    phone: string;
    email: string;
    officeAddress: string;
    website: string;
  };
  term: string;
  issueFocus: string[];
  promises: string[];
  responseStatus: string;
  transparencyScore: number | null;
  responsivenessScore: number | null;
  eventParticipationScore: number | null;
  satisfactionLabel: string;
  lastUpdated: string;
  sources: SourceReference[];
  scoreBreakdown: ScoreBreakdownItem[];
};

export type CivicEvent = {
  slug: string;
  title: string;
  type: string;
  region: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  attendanceLabel: string;
  invitationStatus: string;
  summary: string;
  focusAreas: string[];
};

export type SurveyProgram = {
  slug: string;
  title: string;
  status: string;
  purpose: string;
  estimatedTime: string;
  questions: string[];
};

export type RegionOverview = {
  slug: string;
  name: string;
  state: string;
  description: string;
  priorities: string[];
  eventCount: number;
  representativeCount: number;
};

export type MethodologyCard = {
  title: string;
  summary: string;
  version: string;
  evidencePolicy: string;
};


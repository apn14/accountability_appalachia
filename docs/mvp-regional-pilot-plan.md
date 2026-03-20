# Accountability Appalachian MVP Plan

## 1. Product Requirements Document for the MVP

### Product goal

Launch a credible, mobile-first civic transparency platform for one regional pilot that helps residents identify their representatives, understand the public record, participate in events, and submit structured feedback without needing deep prior political knowledge.

### Primary users

- Constituents with low prior civic knowledge
- Civically engaged residents who want deeper records
- Organizers and administrators
- Researchers and internal analysts
- Representative staff, later in a limited self-service role

### MVP user problems

- Residents do not know who represents them.
- Local and state representative information is fragmented across many sources.
- Event participation and responsiveness are difficult to compare.
- Public records are often not contextualized or easy to inspect on mobile.
- Community priorities are collected inconsistently and stored in ways that are not research-ready.

### MVP scope

- Find-my-representative flow
- Public representative profiles
- Event listing and event detail pages
- Structured question submission
- Survey and issue-priority collection
- Transparency and methodology pages
- Admin dashboard and review queue
- Seeded data model and ingestion-ready foundations

### Non-goals for MVP

- National politics as the primary information model
- Advanced GIS-heavy visualizations as a hard dependency
- Full staff self-service portal
- Automated public publishing without human review
- Dense desktop-first analytics UX

### Core MVP requirements

#### Discovery

- Search by address, zip code, county, district, office, or name
- Resolve users to current local and state representatives
- Keep discovery usable on a phone in under a few taps

#### Representative profiles

- Office, district, party, term, committee assignments, contact details
- Public issue positions and public commitments where sourced
- Score breakdowns with methodology visibility
- Sources, freshness, and last-updated labels

#### Events

- Town halls, office hours, public meetings, and community meetups
- RSVP and event question intake
- Invitation and attendance status for representatives

#### Communication pipeline

- Structured constituent questions
- Moderation state and response status
- Distinction between official response, staff response, and no response

#### Surveys

- Issue-priority surveys
- Consent-aware response collection
- Separation between private respondent data and public aggregate outputs

#### Admin operations

- Review queue for uncertain or incomplete records
- Source verification workflow
- Methodology management
- Audit logs for admin actions

### MVP success metrics

- Median time to find a representative
- Profile view completion rate on mobile
- Event RSVP conversion rate
- Question submission completion rate
- Percentage of public fields with source citations
- Percentage of score outputs with complete breakdowns
- Review queue turnaround time

## 2. Proposed System Architecture

### Architecture pattern

Use a modular monolith for the pilot, with clear domain modules that can later be extracted into services.

### Core modules

- Web application
- Representative data service
- Event service
- Survey service
- Communication service
- Scoring engine
- Ingestion pipeline
- Admin and moderation service
- Analytics and reporting layer

### Recommended stack

- Frontend: Next.js App Router with React and TypeScript
- Styling: Tailwind CSS with a mobile-first design system
- Database: PostgreSQL
- ORM and schema: Prisma
- Search: PostgreSQL full-text search initially
- Background jobs: queue-backed worker for ingestion, notifications, and score recomputation
- Storage: object storage for media and import artifacts
- Auth: secure account system for admins, organizers, and optional constituent accounts

### Deployment topology

- `web`: Next.js app for public and admin routes
- `db`: managed PostgreSQL
- `worker`: background job processor
- `storage`: object store for files and source artifacts
- `observability`: centralized logging and error monitoring

### Architectural principles

- SSR-first public pages for mobile performance
- Human review before publishing uncertain machine-derived changes
- Stable internal service contracts even before physical service separation
- Public data and private survey data kept logically and operationally separate

## 3. Normalized Database Schema

### Core geographic and office structure

- `Region`
  - supports state, county, city, district cluster, and service area
- `Jurisdiction`
  - supports state, county, municipal, legislative, and special district scopes
- `Office`
  - reusable office definitions per jurisdiction
- `District`
  - reusable districts tied to jurisdictions and optionally office types
- `Representative`
  - person-level profile, not term-specific
- `RepresentativeTerm`
  - links a representative to an office and district over time
- `Party`

### Public record entities

- `Committee`
- `CommitteeAssignment`
- `Bill`
- `BillSponsorship`
- `Vote`
- `Issue`
- `IssuePosition`
- `PromiseCommitment`
- `Source`
- `SourceCitation`

### Civic engagement entities

- `Event`
- `EventInvitation`
- `RSVP`
- `ConstituentQuestion`
- `Response`

### Research and survey entities

- `Survey`
- `SurveyQuestion`
- `SurveyResponse`
- `SurveyAnswer`
- `OutreachCampaign`

### Trust and scoring entities

- `ScoreMethodology`
- `ScoreInput`
- `TransparencyScore`
- `SatisfactionScore`

### Operations and governance entities

- `User`
- `Role`
- `UserRole`
- `DataIngestionJob`
- `DataGapFlag`
- `DataOverride`
- `AuditLog`

### Normalization rules

- Representatives are separated from terms so officeholder history is preserved.
- Scores are separated into methodology, inputs, and computed outputs.
- Sources and citations are independent records, not embedded text blobs.
- Survey responses and answers are separated from survey definitions.
- Regions, jurisdictions, offices, and districts are separate so the model scales across counties and states.

### Privacy separation

- Public representative profile data must never store private survey response details.
- Survey response identity and aggregate reporting should be separated through visibility scope and access control.

### Reference implementation

The normalized schema is implemented in [schema.prisma](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/prisma/schema.prisma).

## 4. API and Service Boundaries

### Public API

- `GET /api/v1/public/find`
- `GET /api/v1/public/regions`
- `GET /api/v1/public/regions/:slug`
- `GET /api/v1/public/representatives`
- `GET /api/v1/public/representatives/:slug`
- `GET /api/v1/public/events`
- `GET /api/v1/public/events/:slug`
- `POST /api/v1/public/events/:slug/rsvp`
- `POST /api/v1/public/events/:slug/questions`
- `POST /api/v1/public/questions`
- `GET /api/v1/public/surveys`
- `GET /api/v1/public/surveys/:slug`
- `POST /api/v1/public/surveys/:slug/responses`
- `GET /api/v1/public/transparency/overview`
- `GET /api/v1/public/methodologies`

### Admin API

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/review-queue`
- `POST /api/v1/admin/review-queue/:id/approve`
- `POST /api/v1/admin/review-queue/:id/reject`
- `POST /api/v1/admin/representatives/:id/override`
- `POST /api/v1/admin/events`
- `POST /api/v1/admin/surveys`
- `POST /api/v1/admin/methodologies`

### Internal service boundaries

- Representative service: search, profile assembly, officeholder resolution
- Event service: event catalog, RSVP, attendance
- Communication service: question intake, moderation, responses
- Survey service: survey delivery, consent handling, aggregate reporting
- Scoring service: methodology versioning, input storage, computation
- Ingestion service: connectors, normalization, matching, change detection
- Admin service: review queue, overrides, audit logs

### API design rules

- Public DTOs must include source and freshness metadata where relevant.
- Visibility scope must be explicit, not inferred in the frontend.
- Opinion data must not be mixed into verified public fact payloads.

## 5. Frontend Route Structure

### Public routes

- `/`
- `/find`
- `/representatives/[slug]`
- `/events`
- `/events/[slug]`
- `/questions/new`
- `/surveys`
- `/transparency`
- `/methodology`
- `/regions/[slug]`

### Admin routes

- `/admin`
- `/admin/review`

### Route design principles

- Mobile-first page composition
- Shallow click depth for common tasks
- Progressive disclosure for complex civic records
- Explicit source and trust cues on profile and methodology views

### Reference implementation

The current route scaffold lives under [src/app](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/src/app).

## 6. Admin Workflow Design

### Review queue workflow

1. Connector or editor creates a proposed change.
2. System stores diffs, citations, and confidence markers.
3. Review queue shows missing fields, low-confidence matches, and inferred claims.
4. Reviewer approves, rejects, or overrides.
5. Audit log captures actor, reason, and before/after state.

### Representative update workflow

1. Source data changes are detected.
2. Officeholder and district matches are evaluated.
3. Low-confidence matches become review items.
4. Approved changes publish to public profiles.

### Survey workflow

1. Admin drafts survey.
2. Privacy review confirms data minimization and consent text.
3. Survey is scheduled by region.
4. Aggregates are published separately from raw responses.

### Methodology workflow

1. Admin drafts new methodology version.
2. Weight and rules changes are reviewed.
3. New version is activated with an effective date.
4. Score recomputation runs in the background.

## 7. Transparency Scoring Framework

### Scoring principles

- Every score must be explainable.
- Inputs must be stored separately from outputs.
- Methodology versions must be preserved.
- Insufficient-data states must be allowed.
- Verified facts, inferred signals, and public opinion must remain distinct.

### Score families

- Transparency score
- Responsiveness score
- Event participation score
- Satisfaction indicator

### Example weighted components

#### Transparency score

- Public information completeness
- Source freshness
- Contact openness
- Published issue-position coverage

#### Responsiveness score

- Response completion rate
- Response timeliness
- Response recency

#### Event participation score

- Invitation response rate
- Attendance consistency
- Public engagement frequency

### Score storage model

- `ScoreMethodology` stores versioned rules and weights
- `ScoreInput` stores factor-level evidence and values
- `TransparencyScore` stores computed score snapshots
- `SatisfactionScore` stores opinion-oriented summary signals separately

### Public UX requirements for scores

- Show methodology version
- Show weighted components
- Show last computed timestamp
- Show insufficient-data reason where applicable
- Never present user opinion as a verified factual component

## 8. Data Ingestion Strategy

### Ingestion sources

- Official legislature APIs
- County and municipal websites
- Public CSV and PDF documents
- Manual trusted admin entry
- Event calendars and community-submitted events

### Ingestion pipeline

1. Fetch source material
2. Normalize into canonical entities
3. Match against representatives, offices, districts, and jurisdictions
4. Detect changes and missing fields
5. Create citations and review records
6. Publish only approved or high-confidence verified data

### Uncertainty handling

- Low-confidence matches generate `DataGapFlag` or review items
- Inferred claims require explicit review before public display
- Missing fields remain visible as gaps, not silently guessed values

### MVP ingestion policy

- Start with a small number of official connectors for the pilot region
- Use manual review heavily at first
- Expand automation only after review accuracy is proven

## 9. Phased Rollout Plan

### Phase 0: Foundation

- Finalize schema and service boundaries
- Ship mobile-first public shell
- Stand up admin review queue
- Seed pilot data

### Phase 1: Regional pilot launch

- One region with local and state offices
- Representative discovery
- Profiles with sources and freshness
- Events and question intake
- One survey program

### Phase 2: Multi-county expansion

- Add more regions under the same state
- Reuse connector framework
- Expand review operations
- Improve search and reporting

### Phase 3: Statewide coverage

- Add more office types
- Add bills and vote enrichment at scale
- Expand methodology variants by office type where needed

### Phase 4: Multi-state expansion

- Add state-specific connectors
- Expand regional operations and moderation
- Introduce more robust analytics and search infrastructure

## 10. Risks and Mitigations

### Incorrect public records

- Mitigation: source citations, freshness labels, review workflow, audit logs

### Opaque or misleading scores

- Mitigation: methodology page, factor breakdowns, versioning, insufficient-data states

### Privacy leakage from survey systems

- Mitigation: separate survey response storage, visibility scopes, strict admin access

### Over-automation of uncertain data

- Mitigation: review flags, confidence markers, no auto-publish for ambiguous changes

### Mobile performance regressions

- Mitigation: SSR-first pages, lightweight cards, defer heavy visualizations, limit JS

### Regional data model that does not scale

- Mitigation: region, jurisdiction, office, district, and term normalization from day one

### MVP overbuild

- Mitigation: regional pilot scope, modular monolith, non-goals documented, phased rollout discipline

## Supporting Files

- Product and architecture detail: [product-architecture.md](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/docs/product-architecture.md)
- API detail: [api-design.md](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/docs/api-design.md)
- Schema: [schema.prisma](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/prisma/schema.prisma)

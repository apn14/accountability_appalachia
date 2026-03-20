# Accountability Appalachian Product Architecture

## Product Requirements Breakdown

### North star

Reduce the information gap between constituents and their local and state representatives by making civic information findable, understandable, and actionable on mobile devices.

### MVP outcomes

- A resident can identify their representatives quickly.
- A resident can inspect a representative profile with sources, freshness, and score breakdowns.
- A resident can discover civic events, RSVP, and submit questions.
- Administrators can review imported data, missing fields, and representative changes before publishing.
- Researchers can analyze survey responses and outreach outcomes without exposing raw private respondent data publicly.

### Design principles translated into product requirements

- Mobile-first: all key flows should complete in one hand, within a few taps, with plain-language prompts.
- Trustworthy and nonpartisan: every score or badge must have a methodology, timestamp, and source context.
- Expandable architecture: the system must model region, jurisdiction, office, and term history instead of assuming one county or one state.
- Human review over blind automation: ingestion produces draft updates and gap flags, not silent public overwrites.
- Privacy-aware research: survey identity data and public issue aggregates must be split logically and physically.

## System Architecture

### Recommended MVP topology

Use a modular monolith first, with strict domain boundaries inside one deployable application:

1. `web`
   - Next.js App Router for SSR, server components, and mobile-first page delivery
   - Public routes, admin routes, and route handlers
2. `core domains`
   - representative service
   - event service
   - survey service
   - communication service
   - scoring service
   - ingestion service
   - audit and moderation service
3. `data`
   - PostgreSQL for structured civic records
   - Prisma for schema, migrations, and typed access
4. `jobs`
   - queue-backed background processing for imports, change detection, reminders, score recomputation, and digest generation
5. `search`
   - PostgreSQL full-text search at MVP, optional OpenSearch or Meilisearch later
6. `storage`
   - object storage for profile photos, documents, event media, and import artifacts
7. `analytics`
   - product analytics plus a privacy-aware reporting layer for aggregated civic insights

### Why a modular monolith first

- Lower operational overhead for an MVP team
- Easier cross-domain transactions for source citations, audit logs, and review queues
- Clear path to extract independent services later where scale or operational ownership demands it

## Domain Service Boundaries

### 1. Representative data service

Responsibilities:

- offices, districts, jurisdictions, parties, committee assignments, issue positions
- representative profile assembly
- source traceability
- officeholder history

Owns:

- `Representative`, `Office`, `District`, `Jurisdiction`, `Party`, `Committee`, `RepresentativeTerm`

### 2. Event service

Responsibilities:

- civic event catalog
- invitations, attendance, RSVP, event summaries
- event-specific question collection

Owns:

- `Event`, `EventInvitation`, `RSVP`

### 3. Survey and research service

Responsibilities:

- survey authoring
- consent handling
- anonymized storage boundaries
- export and aggregate reporting

Owns:

- `Survey`, `SurveyQuestion`, `SurveyResponse`, `SurveyAnswer`, `OutreachCampaign`

### 4. Communication pipeline

Responsibilities:

- structured question intake
- moderation status
- response tracking
- official vs staff vs community response distinction

Owns:

- `ConstituentQuestion`, `Response`

### 5. Scoring engine

Responsibilities:

- methodology versioning
- score input capture
- score computation
- breakdown explanations
- insufficient-data handling

Owns:

- `ScoreMethodology`, `ScoreInput`, `TransparencyScore`, `SatisfactionScore`

### 6. Ingestion service

Responsibilities:

- source connectors
- raw import metadata
- change detection
- missing-field detection
- review queue handoff

Owns:

- `Source`, `SourceCitation`, `DataIngestionJob`, `DataGapFlag`, `DataOverride`

### 7. Admin and trust operations

Responsibilities:

- moderation
- manual overrides
- publish workflow
- audit logs
- role-based access

Owns:

- `User`, `Role`, `UserRole`, `AuditLog`

## Frontend Route Map

### Public routes

- `/` landing and cross-platform navigation
- `/find` representative discovery by address, county, zip, office, or name
- `/representatives/[slug]` public representative profile
- `/events` event listing and filters
- `/events/[slug]` event detail, RSVP, and question intake
- `/questions/new` standalone question submission flow
- `/surveys` issue priorities and research participation entry point
- `/transparency` transparency overview, maps, and summaries
- `/methodology` score and source methodology
- `/regions/[slug]` region overview with coverage, issues, and event summaries

### Admin routes

- `/admin` operations dashboard
- `/admin/review` data review queue
- future: `/admin/review/[id]`, `/admin/surveys`, `/admin/events`, `/admin/methodology`

## User Flows

### Find my representative

1. User enters address, zip code, or county.
2. System resolves likely region and district matches.
3. User sees current officeholders grouped by office level.
4. User opens a profile with term dates, contact options, and score breakdowns.

### Ask a question

1. User selects representative or event context.
2. User submits a structured question with optional topic tags.
3. Anti-abuse screening and moderation checks run.
4. Question enters public, pending, or private review state.
5. Response status becomes visible as answered, pending, declined participation, or no response.

### Attend an event

1. User browses upcoming events by date, region, and event type.
2. User opens event details and sees invite status for participating representatives.
3. User RSVPs and optionally submits a question.
4. Admin records attendance and publishes a summary afterward.

### Contribute to surveys

1. User sees a plain-language purpose statement and consent boundaries.
2. User completes issue-priority questions.
3. Private respondent metadata is stored separately from public aggregate reporting.
4. Analysts and admins view trend summaries, not raw public identity details.

## Admin Workflow Map

### Source verification workflow

1. Ingestion connector fetches records and saves a `DataIngestionJob`.
2. System creates proposed entity changes and `DataGapFlag` records.
3. Reviewer compares source citations, freshness timestamps, and diffs.
4. Reviewer approves, rejects, or overrides changes.
5. Audit log records the actor, reason, and before/after state.

### Representative change workflow

1. Connector detects term change or officeholder replacement.
2. New `RepresentativeTerm` is created in draft state.
3. Reviewer confirms district and office mapping.
4. Public profile switches only after approval.

### Survey operations workflow

1. Admin drafts survey and questions.
2. Privacy review confirms data minimization.
3. Survey is scheduled by region and time window.
4. Aggregated results are published separately from internal exports.

## Scoring Engine Design

### Principles

- score inputs are stored separately from computed scores
- methodology is versioned and effective-dated
- each score can be decomposed into weighted factors
- scores may be withheld with an insufficient-data state
- opinion-based signals never masquerade as verified facts

### Recommended score families

- transparency score
- responsiveness score
- event participation score
- constituent satisfaction indicator

### Example weighted inputs

- public information completeness
- contact channel availability
- response timeliness
- event attendance consistency
- published issue position coverage
- source freshness

### Output shape

Each public score should expose:

- score type
- methodology version
- component weights
- component values
- confidence or evidence level
- insufficient-data reason where applicable
- last computed timestamp

## Data Ingestion Framework

### Connector categories

- official legislature APIs
- county or municipal websites
- public CSV or PDF filings
- event calendar feeds
- manual uploads from trusted admins

### Pipeline stages

1. fetch raw source
2. normalize into canonical shape
3. match against existing representatives, offices, and districts
4. detect changes and missing fields
5. create review tasks
6. publish only after approval where confidence is below threshold

### Human review checkpoints

- officeholder identity matching
- district boundary ambiguity
- inferred issue positions
- hand-entered promises or commitments
- source conflicts across multiple inputs

## Deployment Approach

### MVP infrastructure

- Vercel or containerized web deployment for the Next.js app
- managed PostgreSQL
- managed object storage
- background job runner via a queue worker process
- centralized logging and error monitoring

### Environments

- local
- staging
- production

### Release controls

- feature flags for unfinished modules
- protected admin routes
- seed data only in local and preview environments

## Rollout Phases

### Phase 0: Foundation

- schema
- public information architecture
- methodology standards
- admin review queue
- seed data and UX validation

### Phase 1: Regional MVP

- one county or service area
- representative discovery
- profiles with source citations
- event listings and RSVPs
- question intake
- one survey program

### Phase 2: Multi-county expansion

- shared region pages
- connector reuse
- score calibration by office type
- stronger search and export tools

### Phase 3: Statewide coverage

- more office types
- legislative bill and vote enrichment
- staff or representative profile claim flows
- longitudinal research dashboards

### Phase 4: Multi-state platform

- state-specific connectors
- state-specific methodology variants where necessary
- regional operations tooling
- federated analytics governance

## Scaling Plan

### Data scale

- partition heavy event and survey tables by time or region as volume grows
- add read replicas for analytics-heavy workloads
- move search to a specialized engine when cross-state queries become expensive

### Application scale

- split background jobs into dedicated workers first
- extract survey service or ingestion service later if operationally justified
- keep internal APIs stable so extraction does not break the web layer

## Testing Strategy

- unit tests for score calculations, ingestion normalizers, permission checks, and validation
- contract tests for route handlers and domain services
- integration tests for representative discovery, RSVP, and moderation workflows
- accessibility audits on core routes
- seed-data visual review on small-screen breakpoints
- staging smoke tests for connectors before production publish

## Risk Register

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Incorrect public data | Credibility loss | source citations, freshness timestamps, review queue, audit trails |
| Ambiguous entity matching | Wrong officeholder shown | manual review for low-confidence matches, term history model |
| Opaque scores | User distrust | methodology versioning, breakdown UI, insufficient-data state |
| Survey privacy mistakes | Ethical and legal exposure | minimize PII, separate visibility scopes, consent tracking |
| Admin misuse or accidental edits | Public integrity risk | role-based access, audit logs, approval workflows |
| Mobile performance regressions | Core audience blocked | SSR-first pages, light charts, lazy loading, image discipline |
| Overbuilding before launch | Slower time to value | modular MVP, feature flags, phased rollout |


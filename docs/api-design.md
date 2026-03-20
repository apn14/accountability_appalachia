# API Design and Service Boundaries

## API Style

Start with versioned route handlers inside the Next.js application. Keep all writes behind authenticated service functions and all public reads behind explicit query DTOs. When services split later, preserve the same contracts.

Base prefix:

- `/api/v1/public/*`
- `/api/v1/admin/*`
- `/api/v1/internal/*`

## Public API

### Representative discovery

- `GET /api/v1/public/find?query=&region=&officeLevel=`
- `GET /api/v1/public/regions`
- `GET /api/v1/public/regions/:slug`
- `GET /api/v1/public/representatives`
- `GET /api/v1/public/representatives/:slug`

### Events

- `GET /api/v1/public/events`
- `GET /api/v1/public/events/:slug`
- `POST /api/v1/public/events/:slug/rsvp`
- `POST /api/v1/public/events/:slug/questions`

### Questions and communication

- `POST /api/v1/public/questions`
- `GET /api/v1/public/questions/:id/status`

### Surveys and research

- `GET /api/v1/public/surveys`
- `GET /api/v1/public/surveys/:slug`
- `POST /api/v1/public/surveys/:slug/responses`

### Transparency and methodology

- `GET /api/v1/public/transparency/overview`
- `GET /api/v1/public/methodologies`
- `GET /api/v1/public/methodologies/:key/:version`

## Admin API

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/review-queue`
- `POST /api/v1/admin/review-queue/:id/approve`
- `POST /api/v1/admin/review-queue/:id/reject`
- `POST /api/v1/admin/representatives/:id/override`
- `POST /api/v1/admin/surveys`
- `PATCH /api/v1/admin/surveys/:id`
- `POST /api/v1/admin/events`
- `PATCH /api/v1/admin/events/:id`
- `POST /api/v1/admin/methodologies`

## Internal Service Interfaces

### Representative service

- `searchRepresentatives(input)`
- `getRepresentativeProfile(slug)`
- `resolveRepresentation(addressOrRegionInput)`
- `publishRepresentativeUpdate(changeSetId, reviewerId)`

### Event service

- `listEvents(filters)`
- `getEventDetail(slug)`
- `createRsvp(input)`
- `recordAttendance(input)`

### Communication service

- `submitQuestion(input)`
- `moderateQuestion(questionId, action)`
- `recordResponse(input)`

### Survey service

- `listActiveSurveys(regionId)`
- `submitSurveyResponse(input)`
- `getAggregateSurveyInsights(filters)`

### Scoring service

- `computeScore(target, methodologyVersion)`
- `publishScoreSnapshot(target, methodologyVersion)`
- `getScoreBreakdown(target, scoreType)`

### Ingestion service

- `runConnector(connectorKey, regionId?)`
- `normalizePayload(connectorKey, payload)`
- `createReviewItems(diffSet)`
- `resolveDataGap(flagId, action)`

## Auth and Authorization

### Roles

- `constituent`
- `organizer`
- `researcher`
- `moderator`
- `admin`
- `representative_staff`

### Access patterns

- public GET routes are unauthenticated
- submissions use abuse controls, rate limiting, and verification challenges
- admin routes require authenticated role checks and audit logging
- internal routes are service-to-service or server-only

## API Design Rules

- Use cursor pagination on list endpoints.
- Return `sourceCitations`, `freshness`, and `methodologyVersion` on public profile and score payloads.
- Never return private survey respondent details from public endpoints.
- Carry `visibilityScope` and `verificationStatus` through DTOs rather than inferring them in UI code.
- Preserve stable IDs and slugs for public resources.


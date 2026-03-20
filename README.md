# Accountability Appalachian

Accountability Appalachian is a mobile-first civic engagement platform designed to improve transparency, accountability, and communication between constituents and their local and state representatives.

This repository is structured as a production-oriented MVP foundation rather than a throwaway prototype. It includes:

- a public-facing web application shell built with Next.js App Router
- a scalable relational data model in Prisma for representatives, events, surveys, scores, and auditability
- architecture and rollout documentation sized for a regional launch with multi-state expansion in mind

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Data model: Prisma with SQLite for local MVP development, designed to move to PostgreSQL for deployed environments
- Planned supporting services: background jobs, full-text search, object storage, analytics warehouse

## Project Structure

```text
docs/                  Product architecture, API design, and rollout planning
prisma/                Production-oriented schema for civic data and operations
src/app/               Public routes, admin routes, and initial API handlers
src/components/        Reusable UI building blocks
src/lib/               Seed data, types, and shared utilities
scripts/               Environment-aware Prisma and ingestion scripts
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Sync the local database, seed the pilot dataset, and start the app:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

4. Run the first official ingestion connector if needed:

```bash
npm run ingest:wv-house
```

## MVP Scope in This Repo

- landing page
- find-my-representative flow shell
- representative profile page
- events list and event detail page
- survey and transparency overview pages
- methodology page
- admin login, dashboard, and data review queue
- public read and write API endpoints backed by Prisma
- seeded regional pilot data for local testing
- official WV House roster ingestion connector with review-flag generation

## Notes

- Admin login uses the local `.env` credentials. Default local values are defined in `.env.example`.
- The Prisma schema is intentionally broader than the seeded MVP data so the platform can expand without a rewrite.
- Public, inferred, and opinion-based signals are intended to remain clearly separated in both the schema and the user experience.
- For Vercel deployment, use a hosted Postgres `DATABASE_URL`. See [vercel-deployment.md](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/docs/vercel-deployment.md).

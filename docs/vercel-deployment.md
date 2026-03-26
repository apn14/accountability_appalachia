# Vercel Deployment

## Do you need a git repository?

No. You can deploy a local directory to Vercel with the Vercel CLI.

For a real workflow, a Git repository is still strongly recommended because it gives you:

- preview deployments on pull requests
- automatic production deploys on merge
- an audit trail for config and schema changes

## Required production changes

This repo supports two database modes:

- local development: SQLite via `file:./dev.db`
- Vercel deployment: hosted Postgres via `postgresql://...`

The Prisma scripts detect the `DATABASE_URL` scheme and generate the correct client automatically.

## Environment variables

Set these in Vercel:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `CRON_SECRET`

Use [.env.vercel.example](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/.env.vercel.example) as the template.

## Recommended hosting setup

1. Create a hosted Postgres database.
2. Add the Postgres `DATABASE_URL` to Vercel.
3. Import the project into Vercel, either from Git or from the CLI.
4. Deploy with the default Next.js runtime.

This repo includes [vercel.json](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/vercel.json), which runs:

```bash
npm run build
```

This avoids mutating the production schema during every deployment.

## Database initialization before first deploy

Because Vercel no longer runs schema sync as part of the build, you must initialize the hosted database before the first successful production deployment.

Pragmatic MVP path:

1. Point `DATABASE_URL` locally at your hosted Postgres database.
2. Run:

```bash
npm run prisma:push
npm run prisma:seed
```

3. Add the same `DATABASE_URL` in Vercel.
4. Redeploy.

Safer long-term production path:

- create checked-in Prisma migrations
- run `npm run prisma:migrate:deploy` from CI or a controlled release step
- keep Vercel builds read-only with respect to schema changes

## Local to production workflow

### Local

```bash
npm install
npm run prisma:push
npm run prisma:seed
npm run dev
```

### Vercel

```bash
vercel
```

or connect the repository in the Vercel dashboard.

## Scraping and ingestion on Vercel

The app now includes a real official connector for the West Virginia House roster:

- CLI: `npm run ingest:wv-house`
- Admin UI: run the sync from `/admin`

The connector creates:

- `DataIngestionJob` records
- `Source` and `SourceCitation` records
- draft representative updates
- `DataGapFlag` review items for inferred or incomplete data

That keeps ingestion useful without auto-publishing uncertain claims.

## Hourly automation on a free setup

For a free hourly setup, this repo uses GitHub Actions instead of Vercel Cron:

- workflow file: [.github/workflows/hourly-wv-house-sync.yml](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/.github/workflows/hourly-wv-house-sync.yml)
- protected ingestion endpoint: [route.ts](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/src/app/api/internal/ingest/wv-house/route.ts)

### Required GitHub repository secrets

- `CRON_INGEST_URL`
- `CRON_SECRET`
- `VERCEL_AUTOMATION_BYPASS_SECRET` if Vercel Deployment Protection is enabled

Example `CRON_INGEST_URL`:

```text
https://your-production-domain.vercel.app/api/internal/ingest/wv-house
```

Use the same `CRON_SECRET` value in both:

- GitHub repository secrets
- Vercel environment variables

If Vercel Deployment Protection is enabled for your production URL, create a Protection Bypass token in Vercel and store it as `VERCEL_AUTOMATION_BYPASS_SECRET` in GitHub repository secrets. The workflow will send that header before your app-level `CRON_SECRET` check runs.

### Schedule details

The workflow runs at minute 17 of every hour in UTC:

```text
17 * * * *
```

That offset is intentional to reduce contention around the top of the hour.

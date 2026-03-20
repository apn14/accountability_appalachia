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

Use [.env.vercel.example](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/.env.vercel.example) as the template.

## Recommended hosting setup

1. Create a hosted Postgres database.
2. Add the Postgres `DATABASE_URL` to Vercel.
3. Import the project into Vercel, either from Git or from the CLI.
4. Deploy with the default Next.js runtime.

This repo includes [vercel.json](/c:/Users/ajayn/Documents/Various_Projects_Folder/accountability_appalachia/vercel.json), which runs:

```bash
npm run prisma:push && npm run build
```

That is a pragmatic MVP deploy path. For a stricter production workflow later, replace `db push` with checked-in migrations and `prisma migrate deploy`.

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

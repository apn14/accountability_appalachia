import Link from "next/link";

import { logoutAdminAction, runWvHouseRosterSyncAction } from "@/app/actions";
import { requireAdminSession } from "@/lib/auth";
import { getAdminDashboardSummary } from "@/lib/data";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdminSession();
  const params = (await searchParams) ?? {};
  const dashboard = await getAdminDashboardSummary();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Operations</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Admin dashboard</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          This shell is oriented around moderation, verification, and publish controls rather than raw data editing alone.
        </p>
        <form action={logoutAdminAction} className="mt-5">
          <button className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink">
            Log out
          </button>
        </form>
      </section>

      {params.status === "ingestion-complete" ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft">
          Official roster sync completed. Review any newly opened flags before publishing changes.
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Open review items", value: String(dashboard.openReviewItems) },
          { label: "Pending event approvals", value: String(dashboard.pendingEventApprovals) },
          { label: "Methodology drafts", value: String(dashboard.methodologyDrafts) }
        ].map((item) => (
          <div key={item.label} className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-2 font-serif text-4xl text-ink">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <h2 className="font-serif text-3xl text-ink">Primary workflows</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
            <li className="rounded-2xl bg-cream p-4">Review imported representative changes before publish.</li>
            <li className="rounded-2xl bg-cream p-4">Moderate questions, event submissions, and public-facing responses.</li>
            <li className="rounded-2xl bg-cream p-4">Manage score methodologies and record override reasons with audit logs.</li>
          </ul>
        </div>

        <div className="mesh-panel rounded-[32px] p-6 text-cream shadow-soft">
          <h2 className="font-serif text-3xl">Data review queue</h2>
          <p className="mt-4 text-sm leading-7 text-cream/85">
            Every automated connector should be able to route uncertain records into a human review queue.
          </p>
          <Link href="/admin/review" className="mt-6 inline-block rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink">
            Open review queue
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Ingestion</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Run an official roster sync</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            This connector reads the official West Virginia House roster and creates or updates draft records,
            citations, ingestion jobs, and review flags for any uncertain term assignments.
          </p>
          <form action={runWvHouseRosterSyncAction} className="mt-6">
            <button className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream">
              Run WV House roster sync
            </button>
          </form>
        </div>

        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Recent jobs</p>
          <div className="mt-4 grid gap-3">
            {dashboard.jobs.map((job) => (
              <div key={job.id} className="rounded-2xl bg-cream p-4 text-sm text-muted">
                <p className="font-semibold text-ink">{job.connectorKey}</p>
                <p className="mt-1">Status: {job.status.toLowerCase().replaceAll("_", " ")}</p>
                <p>Fetched: {job.recordsFetched ?? 0}</p>
                <p>Changed: {job.recordsChanged ?? 0}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rust">
                  {job.createdAt.toLocaleString("en-US")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

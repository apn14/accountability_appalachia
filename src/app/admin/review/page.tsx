import {
  approveQuestionAction,
  dismissGapFlagAction,
  publishRepresentativeAction,
  rejectQuestionAction,
  resolveGapFlagAction
} from "@/app/actions";
import { requireAdminSession } from "@/lib/auth";
import { getReviewQueue } from "@/lib/data";

export const dynamic = "force-dynamic";

type ReviewQueuePageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

function statusMessage(status?: string) {
  switch (status) {
    case "representative-published":
      return "Representative profile published. The public directory and profile pages were revalidated.";
    case "publish-blocked":
      return "Publication blocked. Resolve missing term data, missing citations, or high-severity review flags first.";
    case "missing-representative":
      return "Representative record was not found. Refresh the review queue and try again.";
    default:
      return null;
  }
}

export default async function ReviewQueuePage({ searchParams }: ReviewQueuePageProps) {
  await requireAdminSession();
  const params = (await searchParams) ?? {};
  const queue = await getReviewQueue();
  const message = statusMessage(params.status);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Review queue</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Human review before public trust.</h1>
      </section>

      {message ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4">
        {queue.draftRepresentatives.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Draft representative</p>
                <h2 className="mt-2 font-serif text-2xl text-ink">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">{item.officeTitle} | {item.district} | {item.party}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{item.publishReason}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-rust">
                  <span className="rounded-full bg-cream px-3 py-1 text-ink">{item.updatedLabel}</span>
                  <span className="rounded-full bg-cream px-3 py-1 text-ink">{item.citationCount} citations</span>
                  <span className="rounded-full bg-cream px-3 py-1 text-ink">{item.openFlagCount} open flags</span>
                  {item.blockingFlagCount ? (
                    <span className="rounded-full bg-sand px-3 py-1 text-ink">
                      {item.blockingFlagCount} blocking flags
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 text-sm text-muted">
                  <p>Email: {item.emailPublic ?? "Not listed on official source"}</p>
                  <p>Phone: {item.phonePublic ?? "Not listed on official source"}</p>
                  <p>
                    Official page:{" "}
                    {item.websiteUrl ? (
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-ink underline underline-offset-4"
                      >
                        Open source record
                      </a>
                    ) : (
                      "Not listed on official source"
                    )}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
                {item.canPublish ? "ready" : "review required"}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <form action={publishRepresentativeAction}>
                <input type="hidden" name="representativeId" value={item.id} />
                <button
                  disabled={!item.canPublish}
                  className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-cream disabled:cursor-not-allowed disabled:bg-moss/40"
                >
                  Publish profile
                </button>
              </form>
            </div>
          </article>
        ))}

        {queue.gapFlags.map((item) => (
          <article key={item.detail} className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">{item.entity}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{item.status}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <form action={resolveGapFlagAction}>
                <input type="hidden" name="flagId" value={item.id} />
                <button className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-cream">Resolve</button>
              </form>
              <form action={dismissGapFlagAction}>
                <input type="hidden" name="flagId" value={item.id} />
                <button className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink">Dismiss</button>
              </form>
            </div>
          </article>
        ))}

        {queue.pendingQuestions.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">{item.entity}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rust">{item.context}</p>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{item.status}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <form action={approveQuestionAction}>
                <input type="hidden" name="questionId" value={item.id} />
                <button className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-cream">Approve</button>
              </form>
              <form action={rejectQuestionAction}>
                <input type="hidden" name="questionId" value={item.id} />
                <button className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink">Reject</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

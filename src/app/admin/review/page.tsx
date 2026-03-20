import {
  approveQuestionAction,
  dismissGapFlagAction,
  rejectQuestionAction,
  resolveGapFlagAction
} from "@/app/actions";
import { requireAdminSession } from "@/lib/auth";
import { getReviewQueue } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  await requireAdminSession();
  const queue = await getReviewQueue();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Review queue</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Human review before public trust.</h1>
      </section>

      <div className="grid gap-4">
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

import { notFound } from "next/navigation";

import { submitQuestionAction, submitRsvpAction } from "@/app/actions";
import { getEventDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

type EventPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventDetail(slug);
  const query = (await searchParams) ?? {};

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      {query.status ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft">
          {query.status === "rsvp-saved" && "Your RSVP was saved."}
          {query.status === "question-saved" && "Your question was submitted for moderation."}
        </div>
      ) : null}

      <section className="mesh-panel rounded-[32px] p-6 text-cream shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">{event.type}</p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{event.title}</h1>
        <div className="mt-5 grid gap-2 text-sm text-cream/80 sm:grid-cols-2">
          <p>{event.dateLabel}</p>
          <p>{event.timeLabel}</p>
          <p>{event.location}</p>
          <p>{event.attendanceLabel}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,0.8fr]">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <h2 className="font-serif text-3xl text-ink">About this event</h2>
          <p className="mt-4 text-sm leading-7 text-muted">{event.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {event.focusAreas.map((area) => (
              <span key={area} className="rounded-full bg-sand px-3 py-2 text-xs font-medium text-ink">
                {area}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Representative status</p>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-muted">
              {event.invitationStatus.map((status) => (
                <p key={status}>{status}</p>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">RSVP</p>
            <form action={submitRsvpAction} className="mt-4 space-y-3">
              <input type="hidden" name="eventSlug" value={event.slug} />
              <input type="hidden" name="website" value="" />
              <input
                name="guestName"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
                placeholder="Your name"
                required
              />
              <input
                name="guestEmail"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
                placeholder="Email address"
                type="email"
                required
              />
              <button className="w-full rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream">
                Reserve a spot
              </button>
            </form>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Submit a question</p>
            <form action={submitQuestionAction} className="mt-4 space-y-3">
              <input type="hidden" name="eventSlug" value={event.slug} />
              <input type="hidden" name="website" value="" />
              <input
                name="submittedName"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
                placeholder="Your name"
                required
              />
              <input
                name="submittedEmail"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
                placeholder="Email address"
                type="email"
                required
              />
              <input
                name="topicLabel"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
                placeholder="Topic"
              />
              <textarea
                name="questionText"
                className="min-h-32 w-full rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
                placeholder="What would you like the invited representative or host to address?"
                required
              />
              <button className="w-full rounded-full border border-ink px-5 py-3 text-sm font-semibold text-ink">
                Send question for moderation
              </button>
            </form>
          </div>
        </aside>
      </section>
    </div>
  );
}

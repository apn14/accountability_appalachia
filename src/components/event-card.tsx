import Link from "next/link";

import { CivicEvent } from "@/lib/types";

type EventCardProps = {
  event: CivicEvent;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="rounded-[28px] border border-border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">{event.type}</p>
          <h3 className="mt-2 font-serif text-2xl text-ink">{event.title}</h3>
        </div>
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
          {event.invitationStatus}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted">
        <p>{event.dateLabel}</p>
        <p>{event.timeLabel}</p>
        <p>{event.location}</p>
        <p>{event.attendanceLabel}</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">{event.summary}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {event.focusAreas.slice(0, 2).map((area) => (
            <span key={area} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
              {area}
            </span>
          ))}
        </div>
        <Link href={`/events/${event.slug}`} className="text-sm font-semibold text-ink underline decoration-rust underline-offset-4">
          Event details
        </Link>
      </div>
    </article>
  );
}


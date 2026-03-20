import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { getEvents } from "@/lib/data";

type EventsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const events = await getEvents();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Events"
        title="Public meetings, town halls, and office hours in one place."
        description="Events are grouped with representative invite status so residents can see not only what is happening, but who is participating and who has not responded."
      />

      {params.status ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft">
          {params.status === "invalid-rsvp" && "Please provide a valid name and email to RSVP."}
          {params.status === "missing-event" && "That event could not be found."}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["All", "Town halls", "Office hours", "Community meetups", "Accepted invites only"].map((filter) => (
          <button key={filter} className="rounded-full border border-border bg-white px-4 py-2 text-sm text-ink shadow-soft">
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>
    </div>
  );
}

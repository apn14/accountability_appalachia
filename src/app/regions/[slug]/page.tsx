import { notFound } from "next/navigation";

import { getRegionDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

type RegionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RegionPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const region = await getRegionDetail(slug);

  if (!region) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="mesh-panel rounded-[32px] p-6 text-cream shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">{region.state}</p>
        <h1 className="mt-2 font-serif text-4xl text-cream">{region.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-cream/85">{region.description}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
          <p className="text-sm text-muted">Tracked representatives</p>
          <p className="mt-2 font-serif text-4xl text-ink">{region.representativeCount}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
          <p className="text-sm text-muted">Upcoming events</p>
          <p className="mt-2 font-serif text-4xl text-ink">{region.eventCount}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
          <p className="text-sm text-muted">Top community priorities</p>
          <p className="mt-2 font-serif text-2xl text-ink">{region.priorities.length}</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <h2 className="font-serif text-3xl text-ink">Priority themes</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {region.priorities.map((priority) => (
            <span key={priority} className="rounded-full bg-sand px-3 py-2 text-sm font-medium text-ink">
              {priority}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <h2 className="font-serif text-3xl text-ink">Upcoming events in this region</h2>
        <div className="mt-5 grid gap-4">
          {region.events.map((event) => (
            <div key={event.slug} className="rounded-2xl bg-cream p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rust">{event.type}</p>
              <p className="mt-2 font-serif text-2xl text-ink">{event.title}</p>
              <p className="mt-2 text-sm text-muted">
                {event.dateLabel} • {event.location}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

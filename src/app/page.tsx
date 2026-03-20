import Link from "next/link";

import { getHomePageData } from "@/lib/data";
import { EventCard } from "@/components/event-card";
import { RepresentativeCard } from "@/components/representative-card";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";

export default async function HomePage() {
  const { events, regions, representatives, siteStats } = await getHomePageData();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-8 sm:px-6 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="mesh-panel rounded-[32px] px-6 py-8 text-cream shadow-soft sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Regional civic transparency
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
            Find your representatives, inspect the record, and show up informed.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-cream/80 sm:text-base">
            Accountability Appalachian is designed for local and state civic engagement where public
            information is fragmented, hard to compare, and often difficult to act on from a phone.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/find" className="rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-ink">
              Find My Representative
            </Link>
            <Link href="/methodology" className="rounded-full border border-cream/25 px-5 py-3 text-center text-sm font-semibold text-cream">
              See how scores work
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">MVP focus</p>
          <div className="mt-4 space-y-4">
            {[
              "Find local and state representatives by region, county, district, or name.",
              "Track responsiveness, event participation, and public information completeness.",
              "Surface civic events, questions, and survey data with explainable methodology."
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-sand/45 p-4 text-sm leading-6 text-ink">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {siteStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Representative discovery"
          title="Simple enough for first-time voters, detailed enough for researchers."
          description="The platform prioritizes plain language first, then reveals deeper legislative, event, and source detail without burying the essentials."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {representatives.map((representative) => (
            <RepresentativeCard key={representative.slug} representative={representative} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Civic connection"
          title="Events become part of the accountability record."
          description="Town halls, office hours, and community meetups are not side content. They help show whether public officials participate, respond, and stay accessible."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Expansion-ready regions"
          title="Launch in one place without hardcoding the future away."
          description="Regions are modeled as first-class entities so the platform can start with one pilot geography and expand to additional counties, districts, and states."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {regions.map((region) => (
            <Link
              key={region.slug}
              href={`/regions/${region.slug}`}
              className="rounded-[28px] border border-border bg-white p-6 shadow-soft transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">{region.state}</p>
              <h3 className="mt-2 font-serif text-2xl text-ink">{region.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{region.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {region.priorities.map((priority) => (
                  <span key={priority} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
                    {priority}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

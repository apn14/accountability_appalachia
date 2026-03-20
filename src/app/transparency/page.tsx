import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { getTransparencyOverview } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const { regions, representatives } = await getTransparencyOverview();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Transparency overview"
        title="A lightweight alternative to GIS-heavy civic dashboards."
        description="The overview is designed to work on older phones and slow networks. Maps can be layered in later, but the core accountability signals remain available as cards and summaries."
      />

      <section className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Regional pulse</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {regions.map((region) => (
              <div key={region.slug} className="rounded-2xl bg-cream p-5">
                <h2 className="font-serif text-2xl text-ink">{region.name}</h2>
                <p className="mt-2 text-sm text-muted">{region.description}</p>
                <p className="mt-3 text-sm text-ink">
                  {region.representativeCount} representatives • {region.eventCount} tracked events
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mesh-panel rounded-[32px] p-6 text-cream shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Interpretation rule</p>
          <p className="mt-4 text-sm leading-7 text-cream/85">
            If evidence is thin, the platform should show insufficient-data states instead of pretending
            certainty. That matters more than filling every screen with a number.
          </p>
          <Link href="/methodology" className="mt-6 inline-block rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink">
            Review methodology
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Representative snapshot</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {representatives.map((representative) => (
            <Link key={representative.slug} href={`/representatives/${representative.slug}`} className="rounded-2xl bg-cream p-5 transition hover:bg-sand">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-ink">{representative.name}</h2>
                  <p className="text-sm text-muted">{representative.officeTitle}</p>
                </div>
                <div className="text-right text-sm text-ink">
                  <p>Transparency {representative.transparencyScore ?? "N/A"}</p>
                  <p>Responsive {representative.responsivenessScore ?? "N/A"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

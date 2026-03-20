import Link from "next/link";
import { notFound } from "next/navigation";

import { ScorePill } from "@/components/score-pill";
import { getRepresentativeProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

type RepresentativePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RepresentativePage({ params }: RepresentativePageProps) {
  const { slug } = await params;
  const representative = await getRepresentativeProfile(slug);

  if (!representative) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-sand text-2xl font-semibold text-ink">
            {representative.photoInitials}
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-rust">
            {representative.officeTitle}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{representative.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {representative.jurisdiction} • {representative.district}
          </p>
          <p className="mt-5 text-sm leading-7 text-muted">{representative.biography}</p>
          <div className="mt-6 grid gap-3 text-sm text-muted">
            <p>Phone: {representative.contact.phone}</p>
            <p>Email: {representative.contact.email}</p>
            <p>Office: {representative.contact.officeAddress}</p>
            <p>Website: {representative.contact.website}</p>
          </div>
        </div>

        <div className="mesh-panel rounded-[32px] p-6 text-cream shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Accountability snapshot</p>
          <h2 className="mt-2 font-serif text-3xl">Explainable scores, not black-box grades.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-cream/80">{representative.responseStatus}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ScorePill label="Transparency" value={representative.transparencyScore} />
            <ScorePill label="Responsiveness" value={representative.responsivenessScore} />
            <ScorePill label="Participation" value={representative.eventParticipationScore} />
          </div>
          <div className="mt-6 rounded-[24px] bg-white/10 p-5">
            <p className="text-sm font-semibold text-gold">Satisfaction signal</p>
            <p className="mt-2 text-sm leading-6 text-cream/85">{representative.satisfactionLabel}</p>
            <p className="mt-4 text-sm text-cream/70">{representative.lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,0.8fr]">
        <div className="space-y-6 rounded-[32px] border border-border bg-white p-6 shadow-soft">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Public record summary</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">What the platform is tracking</h2>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Committees</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {representative.committees.map((committee) => (
                <span key={committee} className="rounded-full bg-sand px-3 py-2 text-xs font-medium text-ink">
                  {committee}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Issue focus</h3>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-muted">
              {representative.issueFocus.map((item) => (
                <li key={item} className="rounded-2xl bg-cream p-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Public commitments</h3>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-muted">
              {representative.promises.map((item) => (
                <li key={item} className="rounded-2xl bg-cream p-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Score breakdown</p>
            <div className="mt-4 space-y-4">
              {representative.scoreBreakdown.map((item) => (
                <div key={item.label} className="rounded-2xl bg-cream p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="text-sm text-muted">{item.value ?? "N/A"}</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rust">
                    Weight {Math.round(item.weight * 100)}%
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Sources</p>
            <div className="mt-4 space-y-3">
              {representative.sources.map((source) => (
                <div key={source.label} className="rounded-2xl bg-cream p-4">
                  <p className="text-sm font-semibold text-ink">{source.label}</p>
                  <p className="mt-1 text-sm text-muted">{source.publisher}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rust">{source.updatedLabel}</p>
                </div>
              ))}
            </div>
            <Link href="/methodology" className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-rust underline-offset-4">
              View methodology and evidence rules
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

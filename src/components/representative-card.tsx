import Link from "next/link";

import { ScorePill } from "@/components/score-pill";
import { Representative } from "@/lib/types";

type RepresentativeCardProps = {
  representative: Representative;
};

export function RepresentativeCard({ representative }: RepresentativeCardProps) {
  return (
    <article className="rounded-[28px] border border-border bg-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sand text-lg font-semibold text-ink">
          {representative.photoInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">
            {representative.officeTitle}
          </p>
          <h3 className="mt-1 font-serif text-2xl text-ink">{representative.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {representative.jurisdiction} • {representative.district}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">{representative.biography}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ScorePill label="Transparency" value={representative.transparencyScore} />
        <ScorePill label="Responsive" value={representative.responsivenessScore} />
        <ScorePill label="Participation" value={representative.eventParticipationScore} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-muted">
        <p>{representative.responseStatus}</p>
        <p>{representative.lastUpdated}</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {representative.issueFocus.slice(0, 2).map((issue) => (
            <span key={issue} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
              {issue}
            </span>
          ))}
        </div>
        <Link href={`/representatives/${representative.slug}`} className="text-sm font-semibold text-ink underline decoration-rust underline-offset-4">
          View profile
        </Link>
      </div>
    </article>
  );
}


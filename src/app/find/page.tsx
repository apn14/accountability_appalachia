import Link from "next/link";

import { RepresentativeCard } from "@/components/representative-card";
import { SectionHeading } from "@/components/section-heading";
import {
  getRepresentativeSearchResolution,
  officeLevelOptions,
  searchRepresentatives
} from "@/lib/data";

export const dynamic = "force-dynamic";

type FindPageProps = {
  searchParams?: Promise<{
    query?: string;
    officeLevel?: string;
  }>;
};

export default async function FindPage({ searchParams }: FindPageProps) {
  const params = (await searchParams) ?? {};
  const representatives = await searchRepresentatives(params.query, params.officeLevel);
  const resolution = getRepresentativeSearchResolution(params.query);
  const levels = officeLevelOptions();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Find my representative"
        title="Search by address, zip code, county, district, office, or name."
        description="This MVP supports district and name search plus West Virginia ZIP-based district lookup. Full street-address geocoding is a later step and should not be implied before it is verified."
      />

      <form className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto]">
          <label className="space-y-2 text-sm text-muted">
            Address or zip code
            <input
              name="query"
              className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-ink outline-none"
              placeholder="123 Main St or 25301"
              defaultValue={params.query ?? ""}
            />
          </label>
          <label className="space-y-2 text-sm text-muted">
            Office level
            <select
              name="officeLevel"
              defaultValue={params.officeLevel ?? "ALL"}
              className="w-full rounded-2xl border border-border bg-cream px-4 py-3 text-ink outline-none"
            >
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream md:self-end">
            Search
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-muted">
          {["25301", "Kanawha County", "District 41", "Jordan Ellis"].map((hint) => (
            <span key={hint} className="rounded-full bg-sand px-3 py-2 text-ink">
              Suggested: {hint}
            </span>
          ))}
        </div>
      </form>

      {resolution ? (
        <div className="rounded-[28px] border border-border bg-white p-5 text-sm text-muted shadow-soft">
          <p className="font-semibold text-ink">
            ZIP lookup {resolution.zipCode}
            {resolution.districtLabel ? ` maps to ${resolution.districtLabel}` : " is outside current WV pilot coverage"}.
          </p>
          <p className="mt-2 leading-6">{resolution.methodology}</p>
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-ink">Likely matches</h2>
          <Link href="/methodology" className="text-sm font-semibold text-ink underline decoration-rust underline-offset-4">
            Why some data may be incomplete
          </Link>
        </div>
        {representatives.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {representatives.map((representative) => (
              <RepresentativeCard key={representative.slug} representative={representative} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-border bg-white p-6 text-sm text-muted shadow-soft">
            No representatives matched that search yet. Try a ZIP code, broader county, district, office, or name query.
          </div>
        )}
      </section>
    </div>
  );
}

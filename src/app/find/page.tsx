import Link from "next/link";

import { RepresentativeCard } from "@/components/representative-card";
import { SectionHeading } from "@/components/section-heading";
import { officeLevelOptions, searchRepresentatives } from "@/lib/data";

type FindPageProps = {
  searchParams?: Promise<{
    query?: string;
    officeLevel?: string;
  }>;
};

export default async function FindPage({ searchParams }: FindPageProps) {
  const params = (await searchParams) ?? {};
  const representatives = await searchRepresentatives(params.query, params.officeLevel);
  const levels = officeLevelOptions();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Find my representative"
        title="Search by address, zip code, county, district, office, or name."
        description="This MVP view demonstrates the mobile-first discovery flow. In production, address resolution would map to districts and current officeholders through verified jurisdiction data."
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
          {["Kanawha County", "District 41", "Commission", "Jordan Ellis"].map((hint) => (
            <span key={hint} className="rounded-full bg-sand px-3 py-2 text-ink">
              Suggested: {hint}
            </span>
          ))}
        </div>
      </form>

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
            No representatives matched that search yet. Try a broader county, district, or office query.
          </div>
        )}
      </section>
    </div>
  );
}

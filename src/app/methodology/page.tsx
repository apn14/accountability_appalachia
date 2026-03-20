import { SectionHeading } from "@/components/section-heading";
import { getMethodologyCards } from "@/lib/data";

export default async function MethodologyPage() {
  const methodologyCards = await getMethodologyCards();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Methodology"
        title="Scores should be inspectable, revisable, and honest about uncertainty."
        description="This page is the public contract for how the platform turns records and participation signals into explainable score outputs."
      />

      <div className="grid gap-5">
        {methodologyCards.map((card) => (
          <section key={card.title} className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-3xl text-ink">{card.title}</h2>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{card.version}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">{card.summary}</p>
            <div className="mt-5 rounded-2xl bg-cream p-4 text-sm leading-6 text-ink">
              Evidence policy: {card.evidencePolicy}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <h2 className="font-serif text-3xl text-ink">Methodology rules</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
          <li className="rounded-2xl bg-cream p-4">Verified public records, user feedback, and internal assumptions must remain visibly distinct.</li>
          <li className="rounded-2xl bg-cream p-4">Score inputs should be stored separately from final outputs so methodology changes do not erase evidence history.</li>
          <li className="rounded-2xl bg-cream p-4">Where evidence is missing or contradictory, show an insufficient-data state rather than a definitive grade.</li>
        </ul>
      </section>
    </div>
  );
}

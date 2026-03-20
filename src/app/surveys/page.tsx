import { submitSurveyResponseAction } from "@/app/actions";
import { SectionHeading } from "@/components/section-heading";
import { getSurveys } from "@/lib/data";

type SurveysPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function SurveysPage({ searchParams }: SurveysPageProps) {
  const params = (await searchParams) ?? {};
  const surveys = await getSurveys();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <SectionHeading
        eyebrow="Issue priorities"
        title="Collect community priorities without blurring public data and private survey data."
        description="Survey programs are designed for ethical collection, explicit consent, and aggregated reporting that can support organizers and researchers without exposing respondent identities."
      />

      {params.status ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft">
          {params.status === "response-saved" && "Your survey response was saved."}
          {params.status === "invalid-response" && "Please answer the survey questions before submitting."}
          {params.status === "missing-survey" && "That survey could not be found."}
        </div>
      ) : null}

      {surveys.map((survey) => (
        <section key={survey.slug} className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">{survey.status}</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">{survey.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{survey.purposeStatement}</p>
            <p className="mt-4 text-sm font-semibold text-ink">
              Estimated time: {Math.max(2, survey.questions.length + 1)} minutes
            </p>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Question set</p>
            <form action={submitSurveyResponseAction} className="mt-4 grid gap-3 text-sm leading-6 text-muted">
              <input type="hidden" name="surveySlug" value={survey.slug} />
              <input type="hidden" name="website" value="" />
              {survey.questions.map((question) => (
                <label key={question.id} className="rounded-2xl bg-cream p-4">
                  <span className="mb-2 block text-sm font-medium text-ink">{question.prompt}</span>
                  <input
                    name={`question:${question.id}`}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none"
                    placeholder="Your answer"
                    required={question.isRequired}
                  />
                </label>
              ))}
              <label className="rounded-2xl bg-cream p-4">
                <span className="mb-2 block text-sm font-medium text-ink">
                  Optional email for follow-up research contact
                </span>
                <input
                  name="respondentEmail"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none"
                  placeholder="name@example.com"
                  type="email"
                />
              </label>
              <button className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream">
                Submit survey
              </button>
            </form>
            <div className="mt-5 rounded-2xl bg-sand/50 p-4 text-sm leading-6 text-ink">
              Consent note: public dashboards should show aggregates and trends, not identifiable respondent-level records.
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

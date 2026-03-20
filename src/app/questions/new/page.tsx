import { submitQuestionAction } from "@/app/actions";
import { getRepresentativeOptions } from "@/lib/data";

export const dynamic = "force-dynamic";

type QuestionSubmissionPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function QuestionSubmissionPage({
  searchParams
}: QuestionSubmissionPageProps) {
  const params = (await searchParams) ?? {};
  const representatives = await getRepresentativeOptions();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      {params.status ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft">
          {params.status === "question-saved" && "Your question was submitted for moderation."}
          {params.status === "invalid" && "Please complete the required fields before submitting."}
          {params.status === "missing-context" && "Please choose a representative or event context for your question."}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Question submission</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Ask a question without needing insider knowledge.</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Questions can be attached to a representative profile or a specific event. Moderation and abuse
          review should happen before public posting or score effects.
        </p>
      </section>

      <form action={submitQuestionAction} className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <div className="grid gap-4">
          <input type="hidden" name="website" value="" />
          <label className="grid gap-2 text-sm text-muted">
            Representative
            <select
              name="representativeSlug"
              className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
              defaultValue=""
            >
              <option value="">Select a representative</option>
              {representatives.map((representative) => (
                <option key={representative.slug} value={representative.slug}>
                  {representative.label}
                </option>
              ))}
            </select>
          </label>
          <input
            name="submittedName"
            className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
            placeholder="Your name"
            required
          />
          <input
            name="submittedEmail"
            className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
            placeholder="Email address"
            type="email"
            required
          />
          <input
            name="topicLabel"
            className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
            placeholder="Topic"
          />
          <textarea
            name="questionText"
            className="min-h-40 rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
            placeholder="Write your question in plain language."
            required
          />
          <label className="rounded-2xl bg-cream p-4 text-sm leading-6 text-muted">
            <input type="checkbox" className="mr-3" defaultChecked />
            I understand this may be moderated before becoming public.
          </label>
          <button className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream">Submit question</button>
        </div>
      </form>
    </div>
  );
}

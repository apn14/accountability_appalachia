import { loginAdminAction } from "@/app/actions";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Admin access</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Sign in to review records.</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Admin access is limited to trusted operators who manage review queues, moderation, and methodology changes.
        </p>

        {params.error ? (
          <div className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm text-ink">
            Invalid email or password.
          </div>
        ) : null}

        <form action={loginAdminAction} className="mt-6 grid gap-4">
          <input
            name="email"
            type="email"
            className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
            placeholder="Admin email"
            required
          />
          <input
            name="password"
            type="password"
            className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink outline-none"
            placeholder="Password"
            required
          />
          <button className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream">
            Sign in
          </button>
        </form>
      </section>
    </div>
  );
}

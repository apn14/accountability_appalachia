import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">Not found</p>
      <h1 className="font-serif text-5xl text-ink">This civic record is not available.</h1>
      <p className="text-sm leading-7 text-muted">
        The record may have moved, the slug may be incorrect, or the page may not be published yet.
      </p>
      <div>
        <Link href="/" className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-cream">
          Return home
        </Link>
      </div>
    </div>
  );
}


import Link from "next/link";

const navItems = [
  { href: "/find", label: "Find reps" },
  { href: "/events", label: "Events" },
  { href: "/surveys", label: "Surveys" },
  { href: "/transparency", label: "Transparency" },
  { href: "/admin", label: "Admin" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream">
            AA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Civic infrastructure
            </p>
            <p className="truncate font-serif text-lg text-ink">Accountability Appalachian</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-muted md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/find" className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-cream">
          Find My Representative
        </Link>
      </div>
    </header>
  );
}


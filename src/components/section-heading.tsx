type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rust">{eyebrow}</p>
      <h2 className="max-w-2xl font-serif text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p>
    </div>
  );
}


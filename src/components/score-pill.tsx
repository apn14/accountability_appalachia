type ScorePillProps = {
  label: string;
  value: number | null;
};

export function ScorePill({ label, value }: ScorePillProps) {
  const tone =
    value === null ? "bg-stone-200 text-stone-700" : value >= 75 ? "bg-moss text-cream" : value >= 55 ? "bg-gold text-ink" : "bg-rust text-cream";

  return (
    <div className={`rounded-full px-3 py-2 text-xs font-semibold ${tone}`}>
      {label}: {value === null ? "Insufficient data" : `${value}/100`}
    </div>
  );
}


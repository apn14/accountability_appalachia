type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl text-ink">{value}</p>
    </div>
  );
}


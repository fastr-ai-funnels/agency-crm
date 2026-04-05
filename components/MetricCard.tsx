type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-slate/40 p-5 shadow-lg shadow-black/40 border border-white/5 border-t-[3px] border-t-accent/70">
      <p className="text-[11px] uppercase tracking-[0.08em] text-white/50 font-medium">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white mono-data">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-white/50">{sublabel}</p>}
    </div>
  );
}

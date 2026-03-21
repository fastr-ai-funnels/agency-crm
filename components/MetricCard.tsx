type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate/40 p-4 shadow-lg shadow-black/40">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {sublabel && <p className="text-sm text-white/60">{sublabel}</p>}
    </div>
  );
}

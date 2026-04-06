type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="glass card-accent p-5 group">
      <p className="heading-xs">{label}</p>
      <p className="mt-3 text-[2rem] font-extrabold text-white mono-data tracking-tight leading-none">{value}</p>
      {sublabel && <p className="mt-2 text-xs text-white/40">{sublabel}</p>}
    </div>
  );
}

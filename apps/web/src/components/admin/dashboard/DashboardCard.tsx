type DashboardCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function DashboardCard({
  label,
  value,
  description,
}: DashboardCardProps) {
  return (
    <article className="border border-white/10 bg-[#0b0b0b] p-7 transition hover:border-white/20">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
        {label}
      </p>

      <p className="heading mt-5 text-5xl font-light text-white">
        {value}
      </p>

      {description && (
        <p className="mt-4 text-xs leading-6 text-white/35">
          {description}
        </p>
      )}
    </article>
  );
}
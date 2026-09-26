const ACCENTS = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  good: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  critical: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-700',
};

/** KPI tile: label, value and an optional hint. The icon carries meaning alongside the label, never alone. */
export default function StatCard({ label, value, hint, icon: Icon, accent = 'neutral', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${onClick ? 'transition-colors hover:border-brand-200 hover:bg-brand-50/40' : ''}`}
    >
      {Icon && <span className={`rounded-lg p-2 ${ACCENTS[accent]}`}><Icon className="size-5" aria-hidden /></span>}
      <span className="min-w-0">
        <span className="block text-sm text-slate-500">{label}</span>
        <span className="mt-0.5 block text-2xl font-semibold text-slate-900 tabular-nums">{value}</span>
        {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      </span>
    </Tag>
  );
}

export function StatGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{children}</div>;
}

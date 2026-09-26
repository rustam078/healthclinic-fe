const ACCENTS = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  good: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  critical: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-700',
};

/** KPI tile: label, value and an optional hint. In a narrow tile the icon is hidden and the number gets smaller. */
export default function StatCard({ label, value, hint, icon: Icon, accent = 'neutral', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`@container flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${onClick ? 'transition-colors hover:border-brand-200 hover:bg-brand-50/40' : ''}`}
    >
      {Icon && <span className={`rounded-lg p-2 @max-[12rem]:hidden ${ACCENTS[accent]}`}><Icon className="size-5" aria-hidden /></span>}
      <span className="min-w-0">
        <span className="block text-sm text-slate-500">{label}</span>
        <span className="mt-0.5 block text-2xl font-semibold text-slate-900 tabular-nums @max-[12rem]:text-xl">{value}</span>
        {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      </span>
    </Tag>
  );
}

/**
 * Several related numbers in one tile. Each number sits above its own label in one column, and a divider
 * line between columns spans both rows, so numbers, labels and dividers always line up.
 * In a narrow tile the parts become rows ("4140 Total") instead of columns.
 */
export function SplitStatCard({ label, parts, icon: Icon, accent = 'neutral' }) {
  return (
    <div className="@container w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <span className={`rounded-md p-1 ${ACCENTS[accent]}`}><Icon className="size-4" aria-hidden /></span>}
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-y-1 @max-[14rem]:flex-col @max-[14rem]:gap-y-0.5">
        {parts.map((part, index) => (
          <div key={part.label} className={`flex flex-col @max-[14rem]:flex-row @max-[14rem]:flex-wrap @max-[14rem]:items-baseline @max-[14rem]:gap-x-1.5 ${
            index > 0 ? 'ml-3 border-l border-slate-200 pl-3 @max-[14rem]:ml-0 @max-[14rem]:border-0 @max-[14rem]:pl-0' : ''}`}>
            <span className={`text-xl leading-7 font-semibold tabular-nums @max-[14rem]:text-lg @max-[14rem]:leading-6 ${part.tone}`}>{part.value}</span>
            <span className={`text-xs font-medium whitespace-nowrap ${part.tone}`}>{part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** columns={4}: four tiles in one row from laptop width up. */
export function StatGrid({ columns, children }) {
  const layout = columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
  return <div className={`grid gap-3 ${layout}`}>{children}</div>;
}

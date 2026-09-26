const filterClass = 'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none';

/** Compact labelled select used in list toolbars. */
export function FilterSelect({ label, value, onChange, options, allLabel = 'All' }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select value={value || ''} onChange={(event) => onChange(event.target.value)} className={`${filterClass} pr-8`}>
        <option value="">{allLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function DateRange({ from, to, onChange }) {
  return (
    <div className="flex min-w-0 flex-1 gap-2 sm:flex-none">
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">From</span>
        <input type="date" value={from || ''} max={to || undefined} onChange={(event) => onChange({ from: event.target.value })} className={filterClass} />
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">To</span>
        <input type="date" value={to || ''} min={from || undefined} onChange={(event) => onChange({ to: event.target.value })} className={filterClass} />
      </label>
    </div>
  );
}

/** Wraps filters; they wrap onto new lines on small screens. */
export function FilterBar({ children }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}

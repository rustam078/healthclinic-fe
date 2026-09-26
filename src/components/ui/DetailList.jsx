/** Label/value grid for detail pages and drawers. items: [{ label, value, wide }]. */
export default function DetailList({ items, columns = 2 }) {
  const grid = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns];
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${grid}`}>
      {items.filter(Boolean).map(({ label, value, wide }) => (
        <div key={label} className={wide ? 'sm:col-span-full' : ''}>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
          <dd className="mt-1 text-sm break-words text-slate-900">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

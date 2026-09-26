/**
 * Table on tablets/desktops, stacked cards on phones.
 * columns: [{ key, header, render(row), className, primary, hideOnMobile }]
 * The `primary` column becomes the card title; an `actions` column goes to the card footer.
 */
export default function DataTable({ columns, rows, onRowClick, rowKey = 'id', caption }) {
  return (
    <>
      <div className="relative hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>{columns.map((column) => <th key={column.key} scope="col" className={`px-4 py-3 whitespace-nowrap ${column.className || ''}`}>{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => <TableRow key={row[rowKey]} row={row} columns={columns} onRowClick={onRowClick} />)}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => <MobileCard key={row[rowKey]} row={row} columns={columns} onRowClick={onRowClick} />)}
      </ul>
    </>
  );
}

const cellValue = (column, row) => (column.render ? column.render(row) : row[column.key] ?? '—');

function TableRow({ row, columns, onRowClick }) {
  const clickable = Boolean(onRowClick);
  return (
    <tr
      onClick={clickable ? () => onRowClick(row) : undefined}
      className={clickable ? 'cursor-pointer hover:bg-slate-50' : ''}
    >
      {columns.map((column) => (
        <td
          key={column.key}
          className={`px-4 py-3 align-middle text-slate-700 ${column.className || ''}`}
          onClick={column.key === 'actions' ? (event) => event.stopPropagation() : undefined}
        >
          {cellValue(column, row)}
        </td>
      ))}
    </tr>
  );
}

function MobileCard({ row, columns, onRowClick }) {
  const primary = columns.find((column) => column.primary) || columns[0];
  const actions = columns.find((column) => column.key === 'actions');
  const details = columns.filter((column) => column !== primary && column !== actions && !column.hideOnMobile);
  return (
    <li className="px-4 py-3">
      <button type="button" disabled={!onRowClick} onClick={() => onRowClick?.(row)} className="block w-full text-left disabled:cursor-default">
        <div className="text-sm font-medium text-slate-900">{cellValue(primary, row)}</div>
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          {details.map((column) => (
            <div key={column.key} className="min-w-0">
              <dt className="text-xs text-slate-500">{column.header}</dt>
              <dd className="truncate text-slate-700">{cellValue(column, row)}</dd>
            </div>
          ))}
        </dl>
      </button>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions.render(row)}</div>}
    </li>
  );
}

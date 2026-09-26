import LogoBox from './LogoBox';
import { formatDate } from '../../utils/format';

/**
 * The clinic's printable page. All sizes come from the template settings (CSS px), so changing a
 * dimension in Settings changes the preview and the printout identically.
 */
export default function DocumentTemplate({ template, settings, title, date = new Date().toISOString(), header, footer, showTitle = true, children }) {
  const accent = template.accentColor || '#0f766e';
  return (
    <article
      className="document-page mx-auto flex flex-col bg-white text-slate-900"
      style={{ width: template.pageWidth, minHeight: template.pageHeight, padding: template.padding, borderTop: `6px solid ${accent}` }}
    >
      {header || <DocumentHeader template={template} settings={settings} accent={accent} />}
      {showTitle ? (
        <div className="flex items-end justify-between gap-4 py-4" style={{ marginTop: template.margin / 2 }}>
          <h1 className="text-lg font-semibold" style={{ color: accent }}>{title || template.title}</h1>
          <p className="text-xs text-slate-500">Date: {formatDate(date)}</p>
        </div>
      ) : <div style={{ height: template.margin }} />}
      <div className="flex flex-1 flex-col text-sm" style={{ marginBottom: template.margin }}>{children}</div>
      {template.showFooter && (footer || <DocumentFooter template={template} settings={settings} />)}
    </article>
  );
}

function DocumentHeader({ template, settings, accent }) {
  const position = settings?.logoPosition || 'LEFT';
  const contact = [settings?.phone, settings?.email, settings?.website].filter(Boolean).join('  •  ');
  return (
    <header
      className={`flex items-center gap-4 border-b ${position === 'RIGHT' ? 'flex-row-reverse' : ''} ${position === 'CENTER' ? 'flex-col justify-center text-center' : ''}`}
      style={{ minHeight: template.headerHeight, borderColor: `${accent}55` }}
    >
      {template.showLogo && (
        <LogoBox src={settings?.logoUrl} width={template.logoAreaWidth} height={template.logoAreaHeight} position={position} />
      )}
      <div className={`min-w-0 flex-1 ${position === 'RIGHT' ? 'text-left' : position === 'CENTER' ? '' : 'text-right'}`}>
        <p className="text-base font-bold" style={{ color: accent }}>{settings?.clinicName}</p>
        {settings?.headerText && <p className="text-xs text-slate-600 italic">{settings.headerText}</p>}
        {settings?.address && <p className="text-xs text-slate-600">{settings.address}</p>}
        {contact && <p className="text-xs text-slate-600">{contact}</p>}
        {settings?.registrationNo && <p className="text-xs text-slate-500">Reg. No: {settings.registrationNo}</p>}
      </div>
    </header>
  );
}

function DocumentFooter({ template, settings }) {
  return (
    <footer className="border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
      {settings?.footerText && <p>{settings.footerText}</p>}
      {template.footerText && <p className="mt-0.5">{template.footerText}</p>}
    </footer>
  );
}

/** Label/value grid inside printed documents. */
export function PrintFields({ items, columns = 2 }) {
  return (
    <dl className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.filter(Boolean).map(({ label, value, wide }) => (
        <div key={label} style={wide ? { gridColumn: '1 / -1' } : undefined}>
          <dt className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
          <dd className="text-sm break-words">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PrintSection({ title, children }) {
  return (
    <section className="mb-5 break-inside-avoid">
      <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">{title}</h2>
      {children}
    </section>
  );
}

/** Simple bordered table for printed lists (history, report rows). */
export function PrintTable({ columns, rows }) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr>{columns.map((column) => <th key={column.key} className="border-b border-slate-300 py-1.5 pr-2 text-left font-semibold">{column.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id ?? index} className="break-inside-avoid">
            {columns.map((column) => <td key={column.key} className="border-b border-slate-100 py-1.5 pr-2 align-top">{column.render ? column.render(row) : row[column.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

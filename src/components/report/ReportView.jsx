import { Printer } from 'lucide-react';
import { usePrint } from '../../context/PrintContext';
import { Card } from '../ui/Card';
import { ErrorState, Skeleton } from '../ui/States';
import Button from '../ui/Button';
import DataTable from '../data/DataTable';
import Pagination from '../data/Pagination';
import { PrintFields, PrintSection, PrintTable } from '../print/DocumentTemplate';
import { formatDate } from '../../utils/format';

/**
 * Shared report layout used by the Appointment and IPD report tabs:
 * filters, summary tiles, charts, a detail table and a printable version.
 */
export default function ReportView({ title, query, filters, toolbar, summary, charts, columns, printColumns, onPageChange, emptyText }) {
  const print = usePrint();
  const report = query.data;
  const printReport = () => print({
    type: 'REPORT',
    title,
    content: <ReportPrint filters={filters} summary={summary(report)} rows={report.rows.content} columns={printColumns} />,
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {toolbar}
          <Button variant="secondary" icon={Printer} onClick={printReport} disabled={!report}>Print report</Button>
        </div>
      </Card>
      {query.isPending && <Card><Skeleton rows={6} /></Card>}
      {query.isError && <Card><ErrorState error={query.error} onRetry={query.refetch} /></Card>}
      {report && (
        <div className={`space-y-4 ${query.isFetching ? 'opacity-70 transition-opacity' : ''}`}>
          {summary(report).tiles}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{charts(report)}</div>
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Details</div>
            {report.rows.content.length === 0
              ? <p className="px-4 py-10 text-center text-sm text-slate-500">{emptyText}</p>
              : <><DataTable columns={columns} rows={report.rows.content} caption={title} /><Pagination {...report.rows} onChange={onPageChange} /></>}
          </Card>
        </div>
      )}
    </div>
  );
}

/** Printed report: period, summary figures and the current page of rows. */
function ReportPrint({ filters, summary, rows, columns }) {
  return (
    <>
      <PrintSection title="Period">
        <p className="text-sm">{formatDate(filters.from)} – {formatDate(filters.to)}</p>
      </PrintSection>
      <PrintSection title="Summary">
        <PrintFields columns={3} items={summary.figures} />
      </PrintSection>
      <PrintSection title="Details">
        {rows.length ? <PrintTable columns={columns} rows={rows} /> : <p className="text-xs text-slate-500">No records.</p>}
      </PrintSection>
    </>
  );
}

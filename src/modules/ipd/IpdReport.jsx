import { BedDouble, CalendarRange, LogOut } from 'lucide-react';
import { ipdApi } from '../../api/endpoints';
import { useReport } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import ReportView from '../../components/report/ReportView';
import StatCard, { StatGrid } from '../../components/report/StatCard';
import { BreakdownBars, ChartCard, TrendChart, fillDays } from '../../components/report/charts';
import { DateRange, FilterBar, FilterSelect } from '../../components/data/Filters';
import { statusOptions } from '../../utils/status';
import { ROOM_TYPE_OPTIONS } from '../../utils/options';
import {
  formatDate, formatDateTime, labelize, monthRange,
} from '../../utils/format';
import { ipdColumns } from './ipdColumns';

/** IPD report inside the IPD module: admissions in a period by status, doctor and room type. */
export default function IpdReport() {
  const [filters, setFilters] = useFilters({ ...monthRange(), status: '', type: '' });
  const query = useReport(ipdApi, filters);

  const toolbar = (
    <FilterBar>
      <DateRange from={filters.from} to={filters.to} onChange={setFilters} />
      <FilterSelect label="Admission status" value={filters.status} onChange={(status) => setFilters({ status })} options={statusOptions('ipd')} />
      <FilterSelect label="Room type" value={filters.type} onChange={(type) => setFilters({ type })} options={ROOM_TYPE_OPTIONS} />
    </FilterBar>
  );

  return (
    <ReportView
      title="IPD report"
      query={query}
      filters={filters}
      toolbar={toolbar}
      summary={summarise}
      charts={(report) => charts(report, filters)}
      columns={ipdColumns()}
      printColumns={PRINT_COLUMNS}
      onPageChange={(page) => setFilters({ page })}
      emptyText="No admissions in this period."
    />
  );
}

export function summarise({ summary, amounts }) {
  const count = (key) => summary[key] || 0;
  const figures = [
    { label: 'Admissions in period', value: count('TOTAL') },
    { label: 'Still admitted', value: count('ADMITTED') },
    { label: 'Discharged', value: count('DISCHARGED') },
    { label: 'Average stay (days)', value: amounts.averageStayDays },
  ];
  const tiles = (
    <StatGrid>
      <StatCard label="Admissions in period" value={count('TOTAL')} icon={CalendarRange} accent="brand" />
      <StatCard label="Still admitted" value={count('ADMITTED')} icon={BedDouble} accent="info" />
      <StatCard label="Discharged" value={count('DISCHARGED')} icon={LogOut} accent="good" />
      <StatCard label="Average stay" value={`${amounts.averageStayDays} days`} icon={CalendarRange} />
    </StatGrid>
  );
  return { tiles, figures };
}

function charts(report, filters) {
  return (
    <>
      <div className="min-w-0 lg:col-span-2">
        <ChartCard title="Admissions per day" subtitle={`${formatDate(filters.from)} – ${formatDate(filters.to)}`}>
          <TrendChart data={fillDays(report.trend, filters.from, filters.to)} unit="admissions" />
        </ChartCard>
      </div>
      <ChartCard title="By room type"><BreakdownBars data={report.breakdown.roomType} /></ChartCard>
      <ChartCard title="Condition at discharge"><BreakdownBars data={report.breakdown.dischargeCondition} emptyText="No discharges in this period" /></ChartCard>
    </>
  );
}

const PRINT_COLUMNS = [
  { key: 'ipdCode', header: 'IPD No.' },
  { key: 'patientName', header: 'Patient' },
  { key: 'a', header: 'Admitted', render: (r) => formatDateTime(r.admittedAt) },
  { key: 'b', header: 'Room / bed', render: (r) => `${r.roomNumber} / ${r.bedNumber}` },
  { key: 's', header: 'Status', render: (r) => labelize(r.status) },
  { key: 'd', header: 'Discharged', render: (r) => (r.dischargedAt ? formatDate(r.dischargedAt) : '—') },
];

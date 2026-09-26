import { Banknote, CalendarCheck, CalendarClock, CalendarDays, Repeat, Stethoscope } from 'lucide-react';
import { appointmentsApi } from '../../api/endpoints';
import { useReport } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import ReportView from '../../components/report/ReportView';
import StatCard, { StatGrid } from '../../components/report/StatCard';
import { BreakdownBars, ChartCard, TrendChart, fillDays } from '../../components/report/charts';
import { DateRange, FilterBar, FilterSelect } from '../../components/data/Filters';
import { statusInfo, statusOptions } from '../../utils/status';
import { APPOINTMENT_TYPE_OPTIONS } from '../../utils/options';
import {
  formatDate, formatMoney, labelize, monthRange,
} from '../../utils/format';
import { appointmentColumns } from './appointmentColumns';

/** Appointment report inside the Appointment module (filters: period, status, visit type). */
export default function AppointmentReport() {
  const [filters, setFilters] = useFilters({ ...monthRange(), status: '', type: '' });
  const query = useReport(appointmentsApi, filters);
  const { data: settings } = useClinicSettings();
  const currency = settings?.currencySymbol;

  const toolbar = (
    <FilterBar>
      <DateRange from={filters.from} to={filters.to} onChange={setFilters} />
      <FilterSelect label="Status" value={filters.status} onChange={(status) => setFilters({ status })} options={statusOptions('appointment')} />
      <FilterSelect label="Visit" value={filters.type} onChange={(type) => setFilters({ type })} options={APPOINTMENT_TYPE_OPTIONS} />
    </FilterBar>
  );

  return (
    <ReportView
      title="Appointment report"
      query={query}
      filters={filters}
      toolbar={toolbar}
      summary={(report) => summarise(report, currency)}
      charts={(report) => charts(report, filters)}
      columns={appointmentColumns({ currency })}
      printColumns={printColumns(currency)}
      onPageChange={(page) => setFilters({ page })}
      emptyText="No appointments in this period."
    />
  );
}

export function summarise({ summary, breakdown, amounts }, currency) {
  const count = (key) => summary[key] || 0;
  const visits = (key) => breakdown.type?.[key] || 0;
  const figures = [
    { label: 'Total appointments', value: count('TOTAL') },
    { label: 'Completed', value: count('COMPLETED') },
    { label: 'Waiting', value: count('SCHEDULED') },
    { label: 'Consultations', value: visits('CONSULTATION') },
    { label: 'Free follow-ups', value: visits('FOLLOW_UP') },
    { label: 'Fees of completed visits', value: formatMoney(amounts.completedFees, currency) },
  ];
  const tiles = (
    <StatGrid>
      <StatCard label="Total appointments" value={count('TOTAL')} icon={CalendarDays} accent="brand" />
      <StatCard label="Completed" value={count('COMPLETED')} icon={CalendarCheck} accent="good" />
      <StatCard label="Waiting" value={count('SCHEDULED')} icon={CalendarClock} accent="info" />
      <StatCard label="Consultations" value={visits('CONSULTATION')} icon={Stethoscope} />
      <StatCard label="Free follow-ups" value={visits('FOLLOW_UP')} icon={Repeat} />
      <StatCard label="Completed visit fees" value={formatMoney(amounts.completedFees, currency)} hint="For information only" icon={Banknote} />
      <StatCard label="All booked fees" value={formatMoney(amounts.expectedFees, currency)} hint="Completed and waiting" icon={Banknote} />
    </StatGrid>
  );
  return { tiles, figures };
}

function charts(report, filters) {
  const { TOTAL, ...byStatus } = report.summary;
  return (
    <>
      <div className="min-w-0 lg:col-span-2">
        <ChartCard title="Appointments per day" subtitle={`${formatDate(filters.from)} – ${formatDate(filters.to)}`}>
          <TrendChart data={fillDays(report.trend, filters.from, filters.to)} unit="appointments" />
        </ChartCard>
      </div>
      <ChartCard title="By status"><BreakdownBars data={byStatus} format={(key) => statusInfo('appointment', key).label} /></ChartCard>
      <ChartCard title="By visit type"><BreakdownBars data={report.breakdown.type} format={(key) => statusInfo('visit', key).label} /></ChartCard>
    </>
  );
}

const printColumns = (currency) => [
  { key: 'd', header: 'Date', render: (r) => formatDate(r.appointmentDate) },
  { key: 'tokenNumber', header: 'Token' },
  { key: 'patientName', header: 'Patient' },
  { key: 't', header: 'Visit', render: (r) => labelize(r.type) },
  { key: 'f', header: 'Fee', render: (r) => (Number(r.fee) ? formatMoney(r.fee, currency) : 'Free') },
  { key: 's', header: 'Status', render: (r) => statusInfo('appointment', r.status).label },
];

import { useQuery } from '@tanstack/react-query';
import {
  BedDouble, CalendarClock, CalendarDays, CheckCircle2, Inbox, LogIn, LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/endpoints';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { ErrorState, Skeleton } from '../../components/ui/States';
import StatCard, { StatGrid } from '../../components/report/StatCard';
import { BreakdownBars, TrendChart, fillDays } from '../../components/report/charts';
import { DateRange } from '../../components/data/Filters';
import { formatDate } from '../../utils/format';
import { statusInfo } from '../../utils/status';
import { PERIODS, resolvePeriod } from './dashboardPeriod';
import {
  AdmissionRow, BedMeter, ListCard, PatientRow, ScheduleRow, ViewAll,
} from './DashboardWidgets';
import ReportSelector from './ReportSelector';

/** Clinic overview built from real module data. Built last, after every module and API existed. */
export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useFilters({ period: 'today', from: '', to: '' });
  const range = resolvePeriod(filters);
  const query = useQuery({ queryKey: [dashboardApi.key, range], queryFn: () => dashboardApi.get(range) });

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome, ${user.fullName} · ${new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date())}`}
        actions={<PeriodPicker filters={filters} setFilters={setFilters} range={range} />}
      />
      {query.isPending && <Card className="mt-4"><Skeleton rows={8} /></Card>}
      {query.isError && <Card className="mt-4"><ErrorState error={query.error} onRetry={query.refetch} /></Card>}
      {query.data && <Overview data={query.data} range={range} />}
    </>
  );
}


function PeriodPicker({ filters, setFilters, range }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div role="group" aria-label="Period" className="inline-flex w-full rounded-lg bg-slate-100 p-1 sm:w-auto">
        {PERIODS.map((period) => (
          <button key={period.id} type="button" aria-pressed={filters.period === period.id}
            onClick={() => setFilters({ period: period.id, ...(period.id === 'custom' ? range : { from: '', to: '' }) })}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium sm:flex-none ${filters.period === period.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            {period.label}
          </button>
        ))}
      </div>
      {filters.period === 'custom'
        ? <DateRange from={filters.from} to={filters.to} onChange={setFilters} />
        : <p className="text-sm text-slate-500">{range.from === range.to ? formatDate(range.from) : `${formatDate(range.from)} – ${formatDate(range.to)}`}</p>}
    </div>
  );
}

function Overview({ data, range }) {
  const { can } = useAuth();
  return (
    <div className="mt-4 space-y-6">
      <HeadlineCards data={data} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {can('APPOINTMENT') && <div className="min-w-0 lg:col-span-3"><AppointmentOverview data={data} range={range} /></div>}
        {can('IPD') && <div className="min-w-0 lg:col-span-2"><IpdOverview data={data} /></div>}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {can('APPOINTMENT') && <ListCard title="Today's queue" action={<ViewAll to="/appointments" />} items={data.todaySchedule} empty="No appointments today" render={(a) => <ScheduleRow appointment={a} />} />}
        {can('IPD') && <ListCard title="Current admissions" action={<ViewAll to="/ipd" />} items={data.currentAdmissions} empty="No patients admitted" render={(a) => <AdmissionRow admission={a} />} />}
        {can('PATIENT') && <ListCard title="Recently registered" action={<ViewAll to="/patients" />} items={data.recentPatients} empty="No patients yet" render={(p) => <PatientRow patient={p} />} />}
      </div>
      <ReportSelector from={range.from} to={range.to} />
    </div>
  );
}

function HeadlineCards({ data }) {
  const navigate = useNavigate();
  const { counts, beds } = data;
  return (
    <StatGrid>
      <StatCard label="Today's appointments" value={counts.TODAY_APPOINTMENTS} icon={CalendarDays} accent="brand" onClick={() => navigate('/appointments')} />
      <StatCard label="Upcoming appointments" value={counts.UPCOMING_APPOINTMENTS} hint="Booked for coming days" icon={CalendarClock} accent="info" />
      <StatCard label="Delete requests" value={counts.PENDING_DELETE_REQUESTS} hint="Waiting for approval" icon={Inbox} accent="warning" onClick={() => navigate('/appointments?tab=requests')} />
      <StatCard label="Currently admitted" value={counts.CURRENTLY_ADMITTED} hint={`${beds.AVAILABLE || 0} of ${beds.TOTAL || 0} beds free`} icon={BedDouble} accent="good" onClick={() => navigate('/ipd')} />
    </StatGrid>
  );
}

function AppointmentOverview({ data, range }) {
  const { TOTAL, ...byStatus } = data.appointmentStatus;
  const pending = byStatus.SCHEDULED || 0;
  const multiDay = range.from !== range.to;
  return (
    <Card className="h-full">
      <CardHeader title="Appointments in period" subtitle={`${TOTAL || 0} in total · ${pending} waiting`} icon={CalendarDays} />
      <CardBody className="space-y-6">
        <BreakdownBars data={byStatus} format={(key) => statusInfo('appointment', key).label} emptyText="No appointments in this period" />
        {multiDay && <TrendChart data={fillDays(data.appointmentTrend, range.from, range.to)} unit="appointments" height={180} />}
      </CardBody>
    </Card>
  );
}

function IpdOverview({ data }) {
  const { counts, beds } = data;
  return (
    <Card className="h-full">
      <CardHeader title="In-patients" subtitle="Admissions and discharges are for the selected period" icon={BedDouble} />
      <CardBody className="space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Figure icon={CheckCircle2} label="Admitted now" value={counts.CURRENTLY_ADMITTED} />
          <Figure icon={LogIn} label="Admissions" value={counts.ADMISSIONS_IN_PERIOD} />
          <Figure icon={LogOut} label="Discharges" value={counts.DISCHARGES_IN_PERIOD} />
        </div>
        <BedMeter beds={beds} />
      </CardBody>
    </Card>
  );
}

function Figure({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-3">
      <Icon className="mx-auto size-4 text-slate-500" aria-hidden />
      <p className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

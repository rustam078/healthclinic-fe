import { useState } from 'react';
import { CHART_KINDS } from '../../components/report/charts';
import { ArrowRight } from 'lucide-react';
import { appointmentsApi, ipdApi } from '../../api/endpoints';
import { useReport } from '../../hooks/useResource';
import { useAuth } from '../../context/AuthContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { SelectField } from '../../components/form/Fields';
import Button from '../../components/ui/Button';
import { TrendChart, fillDays } from '../../components/report/charts';
import { summarise as summariseAppointments } from '../appointment/AppointmentReport';
import { summarise as summariseIpd } from '../ipd/IpdReport';

const REPORTS = [
  { id: 'appointment', label: 'Appointment report', module: 'APPOINTMENT', api: appointmentsApi, summarise: summariseAppointments, unit: 'appointments', link: '/appointments?tab=reports' },
  { id: 'ipd', label: 'IPD report', module: 'IPD', api: ipdApi, summarise: summariseIpd, unit: 'admissions', link: '/ipd?tab=reports' },
];

/** Summary of the Appointment or IPD report for the dashboard period (data comes from the report APIs). */
export default function ReportSelector({ from, to }) {
  const { can } = useAuth();
  const reports = REPORTS.filter((report) => can(report.module));
  const [selected, setSelected] = useState(reports[0]?.id);
  const report = reports.find((item) => item.id === selected);
  if (!report) return null;

  return (
    <Card>
      <CardHeader
        title="Reports"
        subtitle="Summary for the selected period"
        actions={(
          <div className="flex items-end gap-2">
            <SelectField aria-label="Choose report" value={selected} onChange={(event) => setSelected(event.target.value)} options={reports.map((item) => ({ value: item.id, label: item.label }))} />
            <Button variant="secondary" size="sm" to={`${report.link}&from=${from}&to=${to}`} icon={ArrowRight}>Full report</Button>
          </div>
        )}
      />
      <CardBody><ReportSnapshot key={report.id} report={report} from={from} to={to} /></CardBody>
    </Card>
  );
}

function ReportSnapshot({ report, from, to }) {
  const [kind, setKind] = useState('bar');
  const query = useReport(report.api, { from, to, size: 1 });
  const { data: settings } = useClinicSettings();
  if (query.isPending) return <Skeleton rows={4} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  const { figures } = report.summarise(query.data, settings?.currencySymbol);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {figures.map((figure) => (
          <div key={figure.label} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{figure.label}</dt>
            <dd className="text-lg font-semibold text-slate-900 tabular-nums">{figure.value}</dd>
          </div>
        ))}
      </dl>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700">{report.unit === 'appointments' ? 'Appointments' : 'Admissions'} per day</p>
          <div role="group" aria-label="Graph type" className="inline-flex rounded-lg bg-slate-100 p-1">
            {CHART_KINDS.map((option) => (
              <button key={option.id} type="button" aria-pressed={kind === option.id} onClick={() => setKind(option.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium ${kind === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart data={fillDays(query.data.trend, from, to)} unit={report.unit} height={260} kind={kind} />
      </div>
    </div>
  );
}

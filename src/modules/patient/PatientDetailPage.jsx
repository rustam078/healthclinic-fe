import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BedDouble, CalendarDays, CalendarPlus, FileText, History, Pencil, Printer, Trash2 } from 'lucide-react';
import { appointmentsApi, ipdApi, patientsApi } from '../../api/endpoints';
import { useApiMutation, useItem, useList } from '../../hooks/useResource';
import { useAuth } from '../../context/AuthContext';
import { usePrint } from '../../context/PrintContext';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState, QueryState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Tabs, { useTab } from '../../components/ui/Tabs';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ResourceList from '../../components/data/ResourceList';
import ActivityTimeline from '../../components/data/ActivityTimeline';
import { appointmentColumns } from '../appointment/appointmentColumns';
import { ipdColumns } from '../ipd/ipdColumns';
import PatientProfile, { PatientSummary } from './PatientProfile';
import PatientPrint from './PatientPrint';

const TABS = [
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'ipd', label: 'IPD history', icon: BedDouble },
  { id: 'timeline', label: 'Timeline', icon: History },
];

export default function PatientDetailPage() {
  const { id } = useParams();
  const query = useItem(patientsApi, id);
  return (
    <QueryState query={query}>{(patient) => <PatientDetail patient={patient} />}</QueryState>
  );
}

function PatientDetail({ patient }) {
  const { canDo } = useAuth();
  const canViewRx = canDo('PRESCRIPTION_VIEW') || canDo('APPOINTMENT_COMPLETE');
  /** Completed visits open their prescription (view / print) when the role allows it. */
  const rxAction = (row) => canViewRx && row.status === 'COMPLETED' && (
    <Button size="icon" variant="secondary" icon={FileText} to={`/appointments/${row.id}/prescription`}
      title="View / print prescription" aria-label={`View prescription of ${row.appointmentCode}`} />
  );
  const [tab, setTab] = useTab(TABS);
  const appointments = useList(appointmentsApi, { patientId: patient.id, size: 100 });
  const admissions = useList(ipdApi, { patientId: patient.id, size: 100 });
  return (
    <>
      <PageHeader
        title={patient.fullName}
        breadcrumbs={[{ label: 'Patients', to: '/patients' }, { label: patient.patientCode }]}
        subtitle={<span className="flex flex-wrap items-center gap-2"><span className="font-mono">{patient.patientCode}</span><StatusBadge domain="patient" value={patient.status} /></span>}
        actions={<PatientActions patient={patient} appointments={appointments.data} admissions={admissions.data} />}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader title="Profile" /><CardBody><PatientProfile patient={patient} /></CardBody></Card>
        <PatientSummary appointments={appointments.data} admissions={admissions.data} />
      </div>
      <div className="mt-6 space-y-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Patient history" />
        {tab === 'appointments' && <HistoryList query={appointments} columns={appointmentColumns({ omit: ['patient', 'patientPhone', 'age'], actions: rxAction })} emptyTitle="No appointments yet" />}
        {tab === 'ipd' && <HistoryList query={admissions} columns={ipdColumns({ omit: ['patient'] })} emptyTitle="No admissions" />}
        {tab === 'timeline' && <Card><CardBody><ActivityTimeline params={{ patientId: patient.id }} /></CardBody></Card>}
      </div>
    </>
  );
}

function HistoryList({ query, columns, emptyTitle }) {
  return <ResourceList query={query} columns={columns} empty={<EmptyState title={emptyTitle} />} onPageChange={() => {}} />;
}

function PatientActions({ patient, appointments, admissions }) {
  const { can } = useAuth();
  const print = usePrint();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const remove = useApiMutation(() => patientsApi.remove(patient.id), {
    success: 'Patient record deleted', invalidate: [patientsApi.key], onSuccess: () => navigate('/patients'),
  });
  const printProfile = () => print({
    type: 'PATIENT_PROFILE',
    content: <PatientPrint patient={patient} appointments={appointments?.content} admissions={admissions?.content} />,
  });

  return (
    <>
      <Button variant="secondary" icon={Printer} onClick={printProfile}>Print</Button>
      {can('PATIENT', 'WRITE') && <Button variant="secondary" icon={Pencil} to={`/patients/${patient.id}/edit`}>Edit</Button>}
      {can('APPOINTMENT', 'WRITE') && <Button variant="secondary" icon={CalendarPlus} to={`/appointments/new?patientId=${patient.id}`}>Book appointment</Button>}
      {can('IPD', 'WRITE') && <Button variant="secondary" icon={BedDouble} to={`/ipd/admit?patientId=${patient.id}`}>Admit</Button>}
      {can('PATIENT', 'WRITE') && <Button variant="ghost" icon={Trash2} onClick={() => setConfirming(true)} aria-label="Delete patient" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" />}
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        danger
        title="Delete this patient record?"
        message={`${patient.fullName}'s record will be removed from lists. Existing appointments and admissions stay in the history.`}
        confirmLabel="Delete patient"
      />
    </>
  );
}

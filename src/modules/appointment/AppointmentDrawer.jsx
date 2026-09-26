import { Link } from 'react-router-dom';
import { FileText, NotebookPen, Printer, Trash2 } from 'lucide-react';
import { appointmentsApi } from '../../api/endpoints';
import { useItem } from '../../hooks/useResource';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import Drawer from '../../components/ui/Drawer';
import DetailList from '../../components/ui/DetailList';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { QueryState } from '../../components/ui/States';
import ActivityTimeline from '../../components/data/ActivityTimeline';
import { formatDate, formatDateTime, formatMoney, formatTime, labelize } from '../../utils/format';
import { useAppointmentActions } from './useAppointmentActions';
import { usePrintPrescription } from './prescription/usePrintPrescription';

/** Appointment details with complete / delete actions, token slip printing and history. */
export default function AppointmentDrawer({ id, onClose }) {
  const query = useItem(appointmentsApi, id);
  const appointment = query.data;
  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      title={appointment ? `Token ${appointment.tokenNumber} · ${appointment.patientName}` : 'Appointment'}
      subtitle={appointment && <DrawerBadges appointment={appointment} />}
      footer={appointment && <DrawerActions appointment={appointment} onDeleted={onClose} />}
    >
      <QueryState query={query}>{(data) => <AppointmentDetails appointment={data} />}</QueryState>
    </Drawer>
  );
}

function DrawerBadges({ appointment }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <StatusBadge domain="appointment" value={appointment.status} />
      <StatusBadge domain="visit" value={appointment.type} />
      {appointment.deletePending && <span className="text-xs font-medium text-rose-700">Delete requested — awaiting approval</span>}
    </span>
  );
}

function AppointmentDetails({ appointment }) {
  const { data: settings } = useClinicSettings();
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Patient</h3>
        <DetailList items={[
          { label: 'Name', value: <Link to={`/patients/${appointment.patientId}`} className="text-brand-700 hover:underline">{appointment.patientName}</Link> },
          { label: 'Patient ID', value: appointment.patientCode },
          { label: 'Mobile', value: <a href={`tel:${appointment.patientPhone}`} className="hover:underline">{appointment.patientPhone}</a> },
          { label: 'Age / sex', value: [appointment.patientAgeText, labelize(appointment.patientGender)].filter(Boolean).join(' · ') },
          { label: 'Address', value: appointment.patientAddress, wide: true },
        ]} />
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Visit</h3>
        <DetailList items={[
          { label: 'Token', value: <span className="text-lg font-bold">{appointment.tokenNumber}</span> },
          { label: 'Date', value: formatDate(appointment.appointmentDate) },
          { label: 'Booked at', value: formatTime(appointment.appointmentTime) },
          { label: 'Fee (information only)', value: Number(appointment.fee) ? formatMoney(appointment.fee, settings?.currencySymbol) : 'Free follow-up' },
          { label: 'Doctor', value: appointment.doctorName },
          { label: 'Booked by', value: `${appointment.createdBy || 'system'} · ${formatDateTime(appointment.createdAt)}` },
        ]} />
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">History</h3>
        <ActivityTimeline params={{ entityType: 'APPOINTMENT', entityId: appointment.id }} />
      </section>
    </div>
  );
}

function DrawerActions({ appointment, onDeleted }) {
  const actions = useAppointmentActions({ onDeleted });
  const printPrescription = usePrintPrescription();

  return (
    <>
      {actions.canViewRx(appointment) && <Button variant="secondary" icon={Printer} loading={printPrescription.loading} onClick={() => printPrescription.print(appointment)}>Print prescription</Button>}
      {actions.canDelete(appointment) && (
        <Button variant="ghost" icon={Trash2} className="text-rose-700 hover:bg-rose-50" onClick={() => actions.askDelete(appointment)}>{actions.deleteLabel}</Button>
      )}
      {actions.canWrite(appointment) && <Button icon={NotebookPen} to={`/appointments/${appointment.id}/prescription`}>Write prescription</Button>}
      {actions.canViewRx(appointment) && <Button icon={FileText} to={`/appointments/${appointment.id}/prescription`}>View prescription</Button>}
      {actions.dialogs}
    </>
  );
}

import { PrintFields, PrintSection } from '../../components/print/DocumentTemplate';
import { addDays, formatDate, formatMoney, formatTime, labelize } from '../../utils/format';

/** Printable token slip (inside the APPOINTMENT_SLIP template). */
export default function AppointmentSlip({ appointment, settings }) {
  const free = !Number(appointment.fee);
  const validUntil = appointment.type === 'CONSULTATION' && settings
    ? formatDate(addDays(settings.followUpValidityDays, new Date(`${appointment.appointmentDate}T00:00:00`)).toISOString())
    : null;
  return (
    <>
      <div className="mb-5 flex items-center justify-between rounded-lg border-2 border-slate-800 px-4 py-3">
        <span className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Token</span>
        <span className="text-4xl font-bold">{appointment.tokenNumber}</span>
      </div>
      <PrintSection title="Patient">
        <PrintFields items={[
          { label: 'Name', value: appointment.patientName },
          { label: 'Patient ID', value: appointment.patientCode },
          { label: 'Age / sex', value: [appointment.patientAgeText, labelize(appointment.patientGender)].filter(Boolean).join(' · ') || '—' },
          { label: 'Mobile', value: appointment.patientPhone },
        ]} />
      </PrintSection>
      <PrintSection title="Visit">
        <PrintFields items={[
          { label: 'Date', value: formatDate(appointment.appointmentDate) },
          { label: 'Booked at', value: formatTime(appointment.appointmentTime) },
          { label: 'Visit', value: appointment.type === 'FOLLOW_UP' ? 'Follow-up' : 'Consultation' },
          { label: 'Fee', value: free ? 'Free follow-up' : formatMoney(appointment.fee, settings?.currencySymbol) },
          { label: 'Doctor', value: appointment.doctorName, wide: true },
          validUntil && { label: 'Free follow-up visits until', value: validUntil, wide: true },
        ]} />
      </PrintSection>
    </>
  );
}

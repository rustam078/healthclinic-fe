import { PrintFields, PrintSection, PrintTable } from '../../components/print/DocumentTemplate';
import { formatDate, formatDateTime, formatTime, labelize } from '../../utils/format';

/** Printable patient profile with recent appointments and admissions. */
export default function PatientPrint({ patient, appointments = [], admissions = [] }) {
  return (
    <>
      <PrintSection title="Patient">
        <PrintFields
          columns={3}
          items={[
            { label: 'Patient ID', value: patient.patientCode },
            { label: 'Name', value: patient.fullName },
            { label: 'Mobile', value: patient.phone },
            { label: 'Gender', value: labelize(patient.gender) },
            { label: 'Age', value: patient.ageText || '—' },
            { label: 'Blood group', value: patient.bloodGroup || '—' },
            { label: 'Address', value: patient.address || '—', wide: true },
            { label: 'Emergency contact', value: [patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(' · ') || '—', wide: true },
            { label: 'Known allergies', value: patient.allergies || 'None recorded', wide: true },
          ]}
        />
      </PrintSection>
      <PrintSection title="Recent appointments">
        {appointments.length ? (
          <PrintTable
            rows={appointments.slice(0, 10)}
            columns={[
              { key: 'd', header: 'Date', render: (r) => formatDate(r.appointmentDate) },
              { key: 'tokenNumber', header: 'Token' },
              { key: 't', header: 'Type', render: (r) => labelize(r.type) },
              { key: 's', header: 'Status', render: (r) => labelize(r.status) },
            ]}
          />
        ) : <p className="text-xs text-slate-500">No appointments.</p>}
      </PrintSection>
      <PrintSection title="Admissions">
        {admissions.length ? (
          <PrintTable
            rows={admissions.slice(0, 10)}
            columns={[
              { key: 'ipdCode', header: 'IPD No.' },
              { key: 'a', header: 'Admitted', render: (r) => formatDateTime(r.admittedAt) },
              { key: 'd', header: 'Discharged', render: (r) => (r.dischargedAt ? formatDateTime(r.dischargedAt) : '—') },
              { key: 'reason', header: 'Reason' },
            ]}
          />
        ) : <p className="text-xs text-slate-500">No admissions.</p>}
      </PrintSection>
    </>
  );
}

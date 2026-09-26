import { BedDouble, CalendarCheck, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import DetailList from '../../components/ui/DetailList';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { formatDate, formatDateTime, isoDate, labelize } from '../../utils/format';

export default function PatientProfile({ patient }) {
  const age = patient.ageText || null;
  return (
    <DetailList
      columns={3}
      items={[
        { label: 'Mobile', value: patient.phone },
        { label: 'Gender', value: labelize(patient.gender) },
        { label: 'Age', value: age },
        { label: 'Date of birth', value: patient.dateOfBirth ? formatDate(patient.dateOfBirth) : null },
        { label: 'Blood group', value: patient.bloodGroup },
        { label: 'Registered', value: formatDate(patient.createdAt) },
        { label: 'Address', value: patient.address, wide: true },
        { label: 'Emergency contact', value: [patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(' · ') || null },
        { label: 'Known allergies', value: patient.allergies || 'None recorded', wide: true },
        { label: 'Last updated', value: `${formatDateTime(patient.updatedAt)}${patient.updatedBy ? ` by ${patient.updatedBy}` : ''}` },
      ]}
    />
  );
}

/** Quick facts: current admission, next and last visit. */
export function PatientSummary({ appointments, admissions }) {
  const rows = appointments?.content || [];
  const today = isoDate();
  const upcoming = rows.filter((a) => a.appointmentDate >= today && a.status === 'SCHEDULED').at(-1);
  const lastVisit = rows.find((a) => a.status === 'COMPLETED');
  const current = admissions?.content?.find((a) => a.status === 'ADMITTED');
  return (
    <Card>
      <CardHeader title="At a glance" />
      <CardBody className="space-y-4">
        <Fact icon={BedDouble} label="Current admission" value={current
          ? <Link to={`/ipd/${current.id}`} className="text-brand-700 hover:underline">{current.ipdCode} · Room {current.roomNumber}, Bed {current.bedNumber}</Link>
          : 'Not admitted'} />
        <Fact icon={CalendarClock} label="Next appointment" value={upcoming ? `${formatDate(upcoming.appointmentDate)} · token ${upcoming.tokenNumber}` : 'None scheduled'} />
        <Fact icon={CalendarCheck} label="Last completed visit" value={lastVisit ? `${formatDate(lastVisit.appointmentDate)} · ${lastVisit.type === 'FOLLOW_UP' ? 'follow-up' : 'consultation'}` : 'No completed visits'} />
        <p className="text-xs text-slate-500">{appointments?.totalElements ?? 0} appointments · {admissions?.totalElements ?? 0} admissions in total</p>
      </CardBody>
    </Card>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="rounded-lg bg-slate-100 p-2"><Icon className="size-4 text-slate-600" aria-hidden /></div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="text-sm text-slate-900">{value}</div>
      </div>
    </div>
  );
}

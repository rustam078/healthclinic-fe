import { PrintFields, PrintSection, PrintTable } from '../../components/print/DocumentTemplate';
import PrescriptionContent from '../appointment/prescription/PrescriptionSheet';
import { isoDate } from '../../utils/format';

/** Clearly-labelled sample content so the preview looks like a real document. */
const SAMPLE_PATIENT = [
  { label: 'Name', value: 'Sample Patient' },
  { label: 'Patient ID', value: 'PAT-00000' },
  { label: 'Mobile', value: '98xxxxxx00' },
];

const CONTENT = {
  APPOINTMENT_SLIP: () => (
    <>
      <PrintSection title="Patient"><PrintFields items={SAMPLE_PATIENT} /></PrintSection>
      <PrintSection title="Appointment">
        <PrintFields items={[
          { label: 'Date', value: '01 Oct 2026' }, { label: 'Time', value: '10:30 am' },
          { label: 'Doctor', value: 'Sample Doctor' }, { label: 'Type', value: 'Consultation' },
        ]} />
      </PrintSection>
    </>
  ),
  ADMISSION_FORM: () => (
    <>
      <PrintSection title="Patient"><PrintFields columns={3} items={SAMPLE_PATIENT} /></PrintSection>
      <PrintSection title="Admission">
        <PrintFields items={[
          { label: 'Admitted on', value: '01 Oct 2026, 9:00 am' }, { label: 'Doctor', value: 'Sample Doctor' },
          { label: 'Room / bed', value: 'Room 101, Bed 1' }, { label: 'Reason', value: 'Sample reason for admission', wide: true },
        ]} />
      </PrintSection>
    </>
  ),
  DISCHARGE_SUMMARY: () => (
    <>
      <PrintSection title="Patient"><PrintFields columns={3} items={SAMPLE_PATIENT} /></PrintSection>
      <PrintSection title="Discharge">
        <PrintFields items={[
          { label: 'Discharged on', value: '04 Oct 2026, 11:00 am' }, { label: 'Condition', value: 'Recovered' },
          { label: 'Summary', value: 'Sample discharge summary text appears here.', wide: true },
        ]} />
      </PrintSection>
    </>
  ),
  PATIENT_PROFILE: () => (
    <PrintSection title="Patient"><PrintFields columns={3} items={[...SAMPLE_PATIENT, { label: 'Gender', value: 'Female' }, { label: 'Age', value: '34' }, { label: 'Blood group', value: 'B+' }]} /></PrintSection>
  ),
  REPORT: () => (
    <PrintSection title="Details">
      <PrintTable
        columns={[{ key: 'a', header: 'ID' }, { key: 'b', header: 'Patient' }, { key: 'c', header: 'Status' }]}
        rows={[{ id: 1, a: 'APT-00001', b: 'Sample Patient', c: 'Completed' }, { id: 2, a: 'APT-00002', b: 'Sample Patient', c: 'Confirmed' }]}
      />
    </PrintSection>
  ),
};

/** A child aged 1y 6m 10d today. */
function sampleBirthDate() {
  const date = new Date();
  date.setDate(date.getDate() - 10);
  date.setMonth(date.getMonth() - 18);
  return isoDate(date);
}

/** The exact sheet the doctor writes on, with sample patient details and an empty Rx area. */
function PrescriptionSample({ template }) {
  const appointment = {
    patientName: 'Sample Patient', patientDateOfBirth: sampleBirthDate(), patientGender: 'FEMALE',
    patientCode: 'PAT-00000', patientPhone: '98xxxxxx00', patientAddress: 'Sample address, City', appointmentDate: isoDate(),
  };
  const hint = <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">The doctor writes here with pen or finger</p>;
  return <PrescriptionContent template={template} appointment={appointment} rx={hint} />;
}

export default function TemplateSample({ type, template }) {
  if (type === 'PRESCRIPTION') return <PrescriptionSample template={template} />;
  const Content = CONTENT[type] || CONTENT.REPORT;
  return <Content />;
}

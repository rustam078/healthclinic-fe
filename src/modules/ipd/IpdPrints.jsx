import { PrintFields, PrintSection } from '../../components/print/DocumentTemplate';
import { formatDate, formatDateTime, formatMoney, labelize } from '../../utils/format';
import { DoctorSignature, useClinicDoctor } from '../appointment/prescription/PrescriptionSheet';

function PatientBlock({ admission }) {
  return (
    <PrintSection title="Patient">
      <PrintFields columns={3} items={[
        { label: 'Name', value: admission.patientName },
        { label: 'Patient ID', value: admission.patientCode },
        { label: 'Mobile', value: admission.patientPhone },
        { label: 'Gender', value: labelize(admission.patientGender) },
        { label: 'Age', value: admission.patientAgeText || '—' },
        { label: 'IPD No.', value: admission.ipdCode },
      ]} />
    </PrintSection>
  );
}

function AdmissionBlock({ admission }) {
  return (
    <PrintSection title="Admission">
      <PrintFields items={[
        { label: 'Admitted on', value: formatDateTime(admission.admittedAt) },
        { label: 'Doctor', value: admission.doctorName },
        { label: 'Room / bed', value: `Room ${admission.roomNumber} (${labelize(admission.roomType)}), Bed ${admission.bedNumber}` },
        { label: 'Expected discharge', value: admission.expectedDischargeDate ? formatDate(admission.expectedDischargeDate) : '—' },
        { label: 'Reason for admission', value: admission.reason, wide: true },
        admission.notes && { label: 'Notes', value: admission.notes, wide: true },
      ]} />
    </PrintSection>
  );
}

function StayBlock({ admission, currency }) {
  return (
    <PrintSection title="Stay (estimate for information only - not a bill)">
      <PrintFields columns={3} items={[
        { label: 'Days', value: admission.stayDays },
        { label: 'Room charge per day', value: formatMoney(admission.dailyCharge, currency) },
        { label: 'Estimated room charges', value: formatMoney(admission.estimatedCharges, currency) },
      ]} />
    </PrintSection>
  );
}

export function AdmissionRecordPrint({ admission, currency }) {
  return (
    <>
      <PatientBlock admission={admission} />
      <AdmissionBlock admission={admission} />
      <StayBlock admission={admission} currency={currency} />
    </>
  );
}

export function DischargeSummaryPrint({ admission, currency }) {
  const doctor = useClinicDoctor();
  return (
    <>
      <PatientBlock admission={admission} />
      <AdmissionBlock admission={admission} />
      <PrintSection title="Discharge">
        <PrintFields items={[
          { label: 'Discharged on', value: formatDateTime(admission.dischargedAt) },
          { label: 'Condition at discharge', value: labelize(admission.dischargeCondition) },
          { label: 'Summary', value: <span className="whitespace-pre-line">{admission.dischargeSummary}</span>, wide: true },
        ]} />
      </PrintSection>
      <StayBlock admission={admission} currency={currency} />
      <div className="mt-8 flex justify-end">
        <DoctorSignature doctor={doctor} />
      </div>
    </>
  );
}

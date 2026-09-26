import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, LogOut, Pencil, Printer } from 'lucide-react';
import { ipdApi } from '../../api/endpoints';
import { useItem } from '../../hooks/useResource';
import { useAuth } from '../../context/AuthContext';
import { usePrint } from '../../context/PrintContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import DetailList from '../../components/ui/DetailList';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ActivityTimeline from '../../components/data/ActivityTimeline';
import { formatDate, formatDateTime, formatMoney, labelize } from '../../utils/format';
import DischargeModal from './DischargeModal';
import { AdmissionRecordPrint, DischargeSummaryPrint } from './IpdPrints';

export default function IpdDetailPage() {
  const { id } = useParams();
  const query = useItem(ipdApi, id);
  return <QueryState query={query}>{(admission) => <IpdDetail admission={admission} />}</QueryState>;
}

function IpdDetail({ admission }) {
  const { data: settings } = useClinicSettings();
  const currency = settings?.currencySymbol;
  const discharged = admission.status === 'DISCHARGED';
  return (
    <>
      <PageHeader
        title={admission.patientName}
        breadcrumbs={[{ label: 'IPD', to: '/ipd' }, { label: admission.ipdCode }]}
        subtitle={<span className="flex flex-wrap items-center gap-2"><span className="font-mono">{admission.ipdCode}</span><StatusBadge domain="ipd" value={admission.status} /></span>}
        actions={<IpdActions admission={admission} currency={currency} />}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card><CardHeader title="Admission" /><CardBody><AdmissionDetails admission={admission} /></CardBody></Card>
          {discharged && <Card><CardHeader title="Discharge" /><CardBody><DischargeDetails admission={admission} /></CardBody></Card>}
          <Card><CardHeader title="Timeline" /><CardBody><ActivityTimeline params={{ entityType: 'IPD_ADMISSION', entityId: admission.id }} /></CardBody></Card>
        </div>
        <div className="space-y-6">
          <Card><CardHeader title="Patient" /><CardBody><PatientDetails admission={admission} /></CardBody></Card>
          <Card><CardHeader title="Stay" subtitle="Estimate for information only — not a bill" /><CardBody><StayDetails admission={admission} currency={currency} /></CardBody></Card>
        </div>
      </div>
    </>
  );
}

function AdmissionDetails({ admission }) {
  return (
    <DetailList items={[
      { label: 'Admitted on', value: formatDateTime(admission.admittedAt) },
      { label: 'Doctor', value: admission.doctorName },
      { label: 'Room / bed', value: `Room ${admission.roomNumber} · Bed ${admission.bedNumber} (${labelize(admission.roomType)})` },
      { label: 'Expected discharge', value: admission.expectedDischargeDate ? formatDate(admission.expectedDischargeDate) : 'Not set' },
      { label: 'Reason', value: admission.reason, wide: true },
      { label: 'Notes', value: admission.notes && <span className="whitespace-pre-line">{admission.notes}</span>, wide: true },
      { label: 'Admitted by', value: `${admission.createdBy || 'system'} on ${formatDateTime(admission.createdAt)}` },
      { label: 'Last updated', value: `${admission.updatedBy || 'system'} on ${formatDateTime(admission.updatedAt)}` },
    ]} />
  );
}

function DischargeDetails({ admission }) {
  return (
    <DetailList items={[
      { label: 'Discharged on', value: formatDateTime(admission.dischargedAt) },
      { label: 'Condition', value: labelize(admission.dischargeCondition) },
      { label: 'Summary', value: <span className="whitespace-pre-line">{admission.dischargeSummary}</span>, wide: true },
    ]} />
  );
}

function PatientDetails({ admission }) {
  return (
    <DetailList columns={1} items={[
      { label: 'Name', value: <Link to={`/patients/${admission.patientId}`} className="text-brand-700 hover:underline">{admission.patientName}</Link> },
      { label: 'Patient ID', value: admission.patientCode },
      { label: 'Mobile', value: admission.patientPhone },
      { label: 'Gender / age', value: [labelize(admission.patientGender), admission.patientAgeText].filter(Boolean).join(' · ') },
    ]} />
  );
}

function StayDetails({ admission, currency }) {
  return (
    <DetailList columns={1} items={[
      { label: admission.status === 'ADMITTED' ? 'Days so far' : 'Length of stay', value: `${admission.stayDays} day${admission.stayDays === 1 ? '' : 's'}` },
      { label: 'Room charge per day', value: formatMoney(admission.dailyCharge, currency) },
      { label: 'Estimated room charges', value: <span className="text-base font-semibold">{formatMoney(admission.estimatedCharges, currency)}</span> },
    ]} />
  );
}

function IpdActions({ admission, currency }) {
  const { can, canDo } = useAuth();
  const print = usePrint();
  const [discharging, setDischarging] = useState(false);
  const canWrite = can('IPD', 'WRITE');
  const admitted = admission.status === 'ADMITTED';
  const printRecord = () => print({ type: 'ADMISSION_FORM', content: <AdmissionRecordPrint admission={admission} currency={currency} /> });
  const printSummary = () => print({ type: 'DISCHARGE_SUMMARY', content: <DischargeSummaryPrint admission={admission} currency={currency} /> });

  return (
    <>
      <Button variant="secondary" icon={Printer} onClick={printRecord}>Admission record</Button>
      {!admitted && <Button variant="secondary" icon={FileText} onClick={printSummary}>Discharge summary</Button>}
      {canWrite && admitted && <Button variant="secondary" icon={Pencil} to={`/ipd/${admission.id}/edit`}>Edit / move bed</Button>}
      {canWrite && admitted && canDo('IPD_DISCHARGE') && <Button icon={LogOut} onClick={() => setDischarging(true)}>Discharge</Button>}
      <DischargeModal admission={admission} open={discharging} onClose={() => setDischarging(false)} />
    </>
  );
}

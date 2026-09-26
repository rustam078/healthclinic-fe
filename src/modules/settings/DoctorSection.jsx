import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { doctorsApi } from '../../api/endpoints';
import { useSave } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import { FormGrid, TextField } from '../../components/form/Fields';
import {
  intRange, money, optionalEmail, optionalPhone, optionalText, requiredText,
} from '../../utils/validation';
import { useSettingsSave } from './ClinicSection';
import SignaturePad from './SignaturePad';
import { parseStrokes } from '../appointment/prescription/ink';

const doctorSchema = z.object({
  fullName: requiredText('Doctor name', 100),
  specialization: optionalText('Qualification', 100),
  phone: optionalPhone(),
  email: optionalEmail(),
  facilities: optionalText('Facilities', 255),
});

const feeSchema = z.object({
  consultationFee: money('Consultation fee'),
  followUpValidityDays: intRange('Follow-up validity', 0, 365),
});

/** The clinic's single doctor and the consultation terms used for every appointment. */
export default function DoctorSection() {
  const doctor = useQuery({ queryKey: [doctorsApi.key, 'clinic'], queryFn: doctorsApi.clinic });
  const settings = useClinicSettings();
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <QueryState query={doctor}>{(data) => <DoctorCard doctor={data} />}</QueryState>
      <QueryState query={settings}>{(data) => <FeeCard settings={data} />}</QueryState>
    </div>
  );
}

function DoctorCard({ doctor }) {
  const { can } = useAuth();
  const readOnly = !can('SETTINGS', 'WRITE');
  const mutation = useSave(doctorsApi, doctor?.id);
  const [signature, setSignature] = useState(() => parseStrokes(doctor?.signature));
  useEffect(() => { setSignature(parseStrokes(doctor?.signature)); }, [doctor?.signature]);
  const form = useEntityForm({
    schema: doctorSchema,
    defaultValues: {
      fullName: doctor?.fullName || '', specialization: doctor?.specialization || '', phone: doctor?.phone || '',
      email: doctor?.email || '', facilities: doctor?.facilities ?? 'NICU, CPAP, Emergency & Vaccination',
    },
    mutation,
    transform: (values) => ({ ...values, active: true, signature: JSON.stringify(signature) }),
  });
  const { register, errorOf } = form;
  return (
    <Card>
      <CardHeader title="Doctor" subtitle="Used automatically on every appointment, admission and printed document" />
      <CardBody>
        <form onSubmit={form.submit} noValidate>
          <fieldset disabled={readOnly} className="space-y-4">
            <FormGrid>
              <TextField label="Doctor name" required placeholder="e.g. Dr. A. Kumar" className="sm:col-span-2" error={errorOf('fullName')} {...register('fullName')} />
              <TextField label="Qualification" placeholder="e.g. MBBS, MD (Paediatrics)" className="sm:col-span-2" error={errorOf('specialization')} {...register('specialization')} />
              <TextField label="Phone" type="tel" error={errorOf('phone')} {...register('phone')} />
              <TextField label="Email" type="email" error={errorOf('email')} {...register('email')} />
              <TextField label="Facilities" className="sm:col-span-2" hint="Shown under the doctor on the prescription" error={errorOf('facilities')} {...register('facilities')} />
            </FormGrid>
            <SignaturePad strokes={signature} onChange={setSignature} readOnly={readOnly} />
            {!readOnly && <div className="flex justify-end"><Button type="submit" icon={Save} loading={form.saving}>Save doctor</Button></div>}
          </fieldset>
        </form>
      </CardBody>
    </Card>
  );
}

function FeeCard({ settings }) {
  const { can } = useAuth();
  const readOnly = !can('SETTINGS', 'WRITE');
  const form = useEntityForm({
    schema: feeSchema,
    defaultValues: { consultationFee: settings.consultationFee ?? '', followUpValidityDays: settings.followUpValidityDays ?? 30 },
    mutation: useSettingsSave(settings),
  });
  const { register, errorOf, watch } = form;
  const days = Number(watch('followUpValidityDays')) || 0;
  return (
    <Card>
      <CardHeader title="Consultation fee & follow-up" subtitle="Visit type and fee are decided automatically when booking" />
      <CardBody>
        <form onSubmit={form.submit} noValidate>
          <fieldset disabled={readOnly} className="space-y-4">
            <FormGrid>
              <TextField label={`Consultation fee (${settings.currencySymbol})`} required type="number" min="0" step="0.01" inputMode="decimal" error={errorOf('consultationFee')} {...register('consultationFee')} />
              <TextField label="Free follow-up validity (days)" required type="number" min="0" max="365" inputMode="numeric" error={errorOf('followUpValidityDays')} {...register('followUpValidityDays')} />
            </FormGrid>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              After a consultation, visits up to day {days} are free follow-ups. From day {days + 1} the full consultation fee applies again.
            </p>
            {!readOnly && <div className="flex justify-end"><Button type="submit" icon={Save} loading={form.saving}>Save fees</Button></div>}
          </fieldset>
        </form>
      </CardBody>
    </Card>
  );
}

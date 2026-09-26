import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { CalendarPlus, Phone, UserCheck } from 'lucide-react';
import { useEntityForm } from '../../hooks/useEntityForm';
import {
  FormGrid, SegmentedField, TextAreaField, TextField, controlClass,
} from '../../components/form/Fields';
import AgeInput from '../../components/form/AgeInput';
import Button from '../../components/ui/Button';
import { GENDER_OPTIONS } from '../../utils/options';
import { isoDate } from '../../utils/format';
import {
  bookingSchema, emptyBooking, fromPatient, toBookingPayload,
} from './bookingSchema';
import PatientMatches from './PatientMatches';
import VisitSummary from './VisitSummary';

/**
 * Walk-in booking, mobile number first. Existing patients with that number are offered; picking one fills
 * the form. Not picking one means a new patient (e.g. a sibling) with the same number.
 * Doctor, time, visit type, fee and status are set automatically.
 */
export default function BookingForm({ mutation, onCancel }) {
  const [selected, setSelected] = useState(null);
  const form = useEntityForm({
    schema: bookingSchema,
    defaultValues: emptyBooking(),
    mutation,
    transform: (values) => toBookingPayload(values, selected?.id),
  });
  const { register, errorOf, control, reset, getValues, watch } = form;

  const choose = (patient) => {
    setSelected(patient);
    reset({ ...getValues(), ...fromPatient(patient) });
  };
  /** New family member (or a different number): forget the picked patient and clear their details. */
  const startNew = () => {
    if (selected) reset({ ...emptyBooking(), phone: getValues('phone'), appointmentDate: getValues('appointmentDate') });
    setSelected(null);
  };
  const phoneField = register('phone', { onChange: startNew });

  return (
    <form onSubmit={form.submit} noValidate className="space-y-6">
      <section className="space-y-3">
        <PhoneInput field={phoneField} error={errorOf('phone')} />
        <PatientMatches phone={watch('phone')} selectedId={selected?.id} onSelect={choose} onNew={startNew} />
        {selected && <SelectedBanner patient={selected} />}
      </section>
      <section className="space-y-4">
        <FormGrid>
          <TextField label="Patient name" required autoComplete="off" error={errorOf('fullName')} {...register('fullName')} />
          <SegmentedField label="Sex" required options={GENDER_OPTIONS} error={errorOf('gender')} {...register('gender')} />
        </FormGrid>
        <Controller name="dateOfBirth" control={control}
          render={({ field }) => <AgeInput value={field.value} onChange={field.onChange} error={errorOf('dateOfBirth')} />} />
        <TextAreaField label="Address" rows={2} error={errorOf('address')} {...register('address')} />
      </section>
      <section className="space-y-3">
        <TextField label="Date" type="date" required min={isoDate()} className="sm:max-w-xs" error={errorOf('appointmentDate')}
          hint="Patients are seen in the order they are booked (token number)" {...register('appointmentDate')} />
        <VisitSummary patientId={selected?.id} date={watch('appointmentDate')} />
      </section>
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={CalendarPlus} loading={form.saving} className="sm:min-w-44">Book appointment</Button>
      </div>
    </form>
  );
}

function PhoneInput({ field, error }) {
  return (
    <div>
      <label htmlFor="booking-phone" className="mb-1 block text-sm font-medium text-slate-700">
        Mobile number<span className="ml-0.5 text-rose-600" aria-hidden>*</span>
      </label>
      <div className="relative">
        <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input id="booking-phone" type="tel" inputMode="tel" autoComplete="off" autoFocus placeholder="Type the parent's mobile number"
          aria-invalid={Boolean(error)} className={`${controlClass(error)} h-12 pl-9 text-base tracking-wide`} {...field} />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function SelectedBanner({ patient }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      <UserCheck className="size-4 shrink-0" aria-hidden />
      <span>Booking for existing patient <strong>{patient.fullName}</strong> ({patient.patientCode}). Changes below update their record.</span>
    </p>
  );
}

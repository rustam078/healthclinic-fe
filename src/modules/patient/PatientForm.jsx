import { Controller } from 'react-hook-form';
import { Save } from 'lucide-react';
import { patientsApi } from '../../api/endpoints';
import { useSave } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import {
  FormGrid, FormSection, RandomPhoneButton, SelectField, TextAreaField, TextField,
} from '../../components/form/Fields';
import Button from '../../components/ui/Button';
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from '../../utils/options';
import { statusOptions } from '../../utils/status';
import { randomIndianMobile } from '../../utils/format';
import AgeInput from '../../components/form/AgeInput';
import { patientSchema, toPatientForm } from './patientSchema';

/**
 * Patient registration / edit form. `compact` hides the optional sections
 * (used when registering a patient quickly from the appointment or admission screens).
 */
export default function PatientForm({ patient, initialValues, onSaved, onCancel, compact = false }) {
  const mutation = useSave(patientsApi, patient?.id, { onSuccess: onSaved });
  const form = useEntityForm({ schema: patientSchema, defaultValues: toPatientForm(patient, initialValues), mutation });
  const { register, errorOf, setValue } = form;
  const randomPhone = () => setValue('phone', randomIndianMobile(), { shouldValidate: true, shouldDirty: true });

  return (
    <form onSubmit={form.submit} noValidate className="space-y-6">
      <FormSection title="Basic information">
        <FormGrid>
          <TextField label="Full name" required error={errorOf('fullName')} {...register('fullName')} data-autofocus />
          <TextField label="Mobile number" required type="tel" inputMode="tel" error={errorOf('phone')} {...register('phone')}
            trailing={<RandomPhoneButton onClick={randomPhone} />} />
          <SelectField label="Gender" required placeholder="Select gender" options={GENDER_OPTIONS} error={errorOf('gender')} {...register('gender')} />
          {!compact && <SelectField label="Blood group" placeholder="Not known" options={BLOOD_GROUP_OPTIONS} error={errorOf('bloodGroup')} {...register('bloodGroup')} />}
          {patient && <SelectField label="Status" options={statusOptions('patient')} {...register('status')} />}
        </FormGrid>
      </FormSection>
      <Controller name="dateOfBirth" control={form.control}
        render={({ field }) => <AgeInput value={field.value} onChange={field.onChange} error={errorOf('dateOfBirth')} />} />
      {!compact && <OptionalSections form={form} />}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" icon={Save} loading={form.saving}>{patient ? 'Save changes' : 'Register patient'}</Button>
      </div>
    </form>
  );
}


function OptionalSections({ form }) {
  const { register, errorOf } = form;
  return (
    <>
      <FormSection title="Contact">
        <FormGrid>
          <TextAreaField label="Address" rows={2} className="sm:col-span-2" error={errorOf('address')} {...register('address')} />
          <TextField label="Emergency contact name" error={errorOf('emergencyContactName')} {...register('emergencyContactName')} />
          <TextField label="Emergency contact phone" type="tel" error={errorOf('emergencyContactPhone')} {...register('emergencyContactPhone')} />
        </FormGrid>
      </FormSection>
      <FormSection title="Medical">
        <TextAreaField label="Known allergies" rows={2} hint="Leave empty if none known" error={errorOf('allergies')} {...register('allergies')} />
      </FormSection>
    </>
  );
}

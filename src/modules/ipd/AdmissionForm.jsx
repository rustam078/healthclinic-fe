import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useBedOptions } from '../../hooks/useLookups';
import {
  FormGrid, FormSection, LookupSelect, TextField,
} from '../../components/form/Fields';
import PatientPicker from '../../components/form/PatientPicker';
import Button from '../../components/ui/Button';
import { admissionSchema, toAdmissionForm } from './ipdSchema';

/** Admit a patient, or edit an active admission (doctor, bed, dates, notes). */
export default function AdmissionForm({ admission, patient: initialPatient, initialValues, mutation, onCancel }) {
  const [patient, setPatient] = useState(initialPatient || null);
  const form = useEntityForm({
    schema: admissionSchema,
    defaultValues: toAdmissionForm(admission, { ...initialValues, ...(initialPatient?.id && { patientId: String(initialPatient.id) }) }),
    mutation,
  });
  const { register, errorOf, setValue } = form;
  const beds = useBedOptions(admission?.bedId);
  const choosePatient = (value) => {
    setPatient(value);
    setValue('patientId', value ? String(value.id) : '', { shouldValidate: Boolean(value) });
  };

  return (
    <form onSubmit={form.submit} noValidate className="space-y-6">
      <FormSection title="Patient">
        <PatientPicker selected={patient} onSelect={choosePatient} error={errorOf('patientId')} required disabled={Boolean(admission)} />
      </FormSection>
      <FormSection title="Admission">
        <FormGrid>
          <LookupSelect
            className="sm:col-span-2" loading={beds.isLoading} label="Room / bed" required placeholder="Select bed" options={beds.options}
            error={errorOf('bedId')} hint={beds.empty ? <NoBeds /> : 'Only available and reserved beds are listed'} {...register('bedId')}
          />
          <TextField label="Admitted on" type="datetime-local" required error={errorOf('admittedAt')} {...register('admittedAt')} />
          <TextField label="Expected discharge" type="date" error={errorOf('expectedDischargeDate')} {...register('expectedDischargeDate')} />
          <TextField label="Reason for admission" required className="sm:col-span-2" error={errorOf('reason')} {...register('reason')} />
        </FormGrid>
      </FormSection>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={Save} loading={form.saving}>{admission ? 'Save changes' : 'Admit patient'}</Button>
      </div>
    </form>
  );
}

function NoBeds() {
  return <span className="text-amber-700">No free beds. Free or add beds in <Link to="/ipd?tab=beds" className="underline">Beds</Link>.</span>;
}

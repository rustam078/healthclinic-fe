import { LogOut } from 'lucide-react';
import { bedsApi, ipdApi, roomsApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/form/Fields';
import { DISCHARGE_CONDITION_OPTIONS } from '../../utils/options';
import { isoDateTime } from '../../utils/format';
import { dischargeSchema } from './ipdSchema';

/** Discharge workflow: date/time, condition and summary. Frees the bed. */
export default function DischargeModal({ admission, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={`Discharge ${admission.patientName}`} description={`${admission.ipdCode} · Room ${admission.roomNumber}, Bed ${admission.bedNumber}`} size="lg">
      {open && <DischargeForm admission={admission} onClose={onClose} />}
    </Modal>
  );
}

function DischargeForm({ admission, onClose }) {
  const mutation = useApiMutation((body) => ipdApi.post(admission.id, 'discharge', body), {
    success: 'Patient discharged',
    invalidate: [ipdApi.key, bedsApi.key, roomsApi.key, 'activity', 'dashboard'],
    onSuccess: onClose,
  });
  const form = useEntityForm({
    schema: dischargeSchema(admission.admittedAt),
    defaultValues: { dischargedAt: isoDateTime(), dischargeCondition: 'RECOVERED', dischargeSummary: '' },
    mutation,
  });
  const { register, errorOf } = form;

  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <FormGrid>
        <TextField label="Discharged on" type="datetime-local" required error={errorOf('dischargedAt')} {...register('dischargedAt')} />
        <SelectField label="Condition at discharge" required options={DISCHARGE_CONDITION_OPTIONS} error={errorOf('dischargeCondition')} {...register('dischargeCondition')} />
        <TextAreaField label="Discharge summary" required rows={4} className="sm:col-span-2" placeholder="Diagnosis, treatment given and condition at discharge" error={errorOf('dischargeSummary')} {...register('dischargeSummary')} />
      </FormGrid>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" icon={LogOut} loading={form.saving}>Discharge patient</Button>
      </div>
    </form>
  );
}

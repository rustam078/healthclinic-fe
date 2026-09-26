import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerErrors, toPayload } from '../utils/validation';

/**
 * react-hook-form + zod + a save mutation in one place.
 * `transform` adapts form values to the API payload; backend field errors are shown on the fields.
 */
export function useEntityForm({ schema, defaultValues, mutation, transform = (values) => values }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues, mode: 'onTouched' });

  const save = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(toPayload(transform(values)));
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  // Forms inside modals are portalled, but React still bubbles submit to an outer form; stop that.
  const submit = (event) => {
    event?.stopPropagation();
    return save(event);
  };

  /** Error message for a field (for TextField/SelectField `error` prop). */
  const errorOf = (name) => form.formState.errors[name]?.message;

  return { ...form, submit, errorOf, saving: mutation.isPending };
}

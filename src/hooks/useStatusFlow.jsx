import { useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useApiMutation } from './useResource';

/**
 * Status changes with a confirmation step (and optional reason).
 * const flow = useStatusFlow(appointmentsApi, { invalidate: [...] });
 * flow.ask(row, { status: 'CANCELLED', label: 'Cancel appointment', danger: true, askReason: true, message })
 * Render {flow.dialog} once in the component.
 */
export function useStatusFlow(resource, { invalidate = [], onDone } = {}) {
  const [pending, setPending] = useState(null);
  const mutation = useApiMutation(
    ({ row, action, reason }) => resource.status(row.id, action.status, reason),
    {
      success: (result) => pending?.action.success || 'Status updated',
      invalidate: [resource.key, 'activity', 'dashboard', ...invalidate],
      onSuccess: (result) => { setPending(null); onDone?.(result); },
    },
  );

  const dialog = (
    <ConfirmDialog
      open={Boolean(pending)}
      onClose={() => setPending(null)}
      onConfirm={(reason) => mutation.mutate({ ...pending, reason })}
      loading={mutation.isPending}
      title={pending?.action.label}
      message={pending?.action.message}
      confirmLabel={pending?.action.label}
      danger={pending?.action.danger}
      askReason={pending?.action.askReason}
    />
  );

  return { ask: (row, action) => setPending({ row, action }), dialog, isPending: mutation.isPending };
}

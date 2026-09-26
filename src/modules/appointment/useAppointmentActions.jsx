import { useState } from 'react';
import { appointmentsApi, deleteRequestsApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

/**
 * "Mark completed" and "Delete / request deletion" for a scheduled appointment, with confirmations.
 * Who may complete or delete directly is set per role in Settings -> Permissions.
 */
export function useAppointmentActions({ onDeleted } = {}) {
  const { can, canDo } = useAuth();
  const isApprover = canDo('APPOINTMENT_APPROVE_DELETE');
  const [deleting, setDeleting] = useState(null);
  const remove = useApiMutation((row) => appointmentsApi.requestDelete(row.id), {
    success: (body) => body.message,
    invalidate: [appointmentsApi.key, deleteRequestsApi.key, 'activity', 'dashboard'],
    onSuccess: () => { setDeleting(null); onDeleted?.(); },
  });
  const canAct = (row) => can('APPOINTMENT', 'WRITE') && row?.status === 'SCHEDULED';
  /** May open the prescription pad to write (the doctor); everyone else can only view completed ones. */
  const canWrite = (row) => canAct(row) && canDo('APPOINTMENT_COMPLETE');
  const canViewRx = (row) => row?.status === 'COMPLETED' && (canDo('PRESCRIPTION_VIEW') || canDo('APPOINTMENT_COMPLETE'));

  const dialogs = (
    <>
      <ConfirmDialog
        open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => remove.mutate(deleting)} loading={remove.isPending} danger
        title={isApprover ? 'Delete this appointment?' : 'Request deletion?'}
        message={isApprover ? 'The booking will be permanently removed from the list.' : 'The booking moves to the Requests tab until an authorised user approves or rejects it.'}
        confirmLabel={isApprover ? 'Delete appointment' : 'Send request'}
      />
    </>
  );

  return {
    canWrite,
    canViewRx,
    canDelete: (row) => canAct(row) && !row.deletePending,
    askDelete: setDeleting,
    deleteLabel: isApprover ? 'Delete' : 'Request deletion',
    dialogs,
  };
}

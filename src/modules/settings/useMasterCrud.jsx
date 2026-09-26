import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useApiMutation } from '../../hooks/useResource';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

/**
 * Shared state for the small master-data screens in Settings (doctors, users, rooms):
 * which record is being edited and a confirmed delete.
 */
export function useMasterCrud(resource, { noun, invalidate = [] }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const remove = useApiMutation((row) => resource.remove(row.id), {
    success: `${noun} removed`,
    invalidate: [resource.key, ...invalidate],
    onSuccess: () => setDeleting(null),
  });

  const deleteDialog = (
    <ConfirmDialog
      open={Boolean(deleting)}
      onClose={() => setDeleting(null)}
      onConfirm={() => remove.mutate(deleting)}
      loading={remove.isPending}
      danger
      title={`Remove this ${noun.toLowerCase()}?`}
      message="It will no longer appear in lists. Existing records that use it are kept."
      confirmLabel="Remove"
    />
  );

  return {
    editing,
    openNew: () => setEditing({}),
    openEdit: setEditing,
    close: () => setEditing(null),
    askDelete: setDeleting,
    deleteDialog,
  };
}

/** Edit / remove buttons for a master-data row. */
export function RowActions({ row, crud, canDelete = true }) {
  return (
    <div className="flex justify-end gap-1">
      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => crud.openEdit(row)}>Edit</Button>
      {canDelete && <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-700 hover:bg-rose-50" onClick={() => crud.askDelete(row)} aria-label="Remove" />}
    </div>
  );
}

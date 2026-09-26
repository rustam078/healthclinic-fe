import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * Confirmation before destructive or irreversible actions.
 * With `askReason`, shows an optional reason box and passes the text to onConfirm.
 */
export default function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger, loading, askReason,
}) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (open) setReason(''); }, [open]);

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>Go back</Button>
      <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={() => onConfirm(reason.trim() || undefined)}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={footer}>
      <p className="text-sm text-slate-600">{message}</p>
      {askReason && (
        <label className="mt-4 block text-sm">
          <span className="font-medium text-slate-700">Reason (optional)</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={255}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </label>
      )}
    </Modal>
  );
}

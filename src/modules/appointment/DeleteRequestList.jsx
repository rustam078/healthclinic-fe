import { useState } from 'react';
import { Check, Inbox, X } from 'lucide-react';
import { appointmentsApi, deleteRequestsApi } from '../../api/endpoints';
import { useApiMutation, useList } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../../context/AuthContext';
import ResourceList from '../../components/data/ResourceList';
import SearchBar from '../../components/data/SearchBar';
import { FilterBar, FilterSelect } from '../../components/data/Filters';
import { EmptyState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import { statusOptions } from '../../utils/status';
import { formatDate, formatDateTime } from '../../utils/format';

const DECISIONS = {
  APPROVED: { title: 'Delete this appointment?', message: 'The booking will be permanently removed from the appointment list.', confirm: 'Approve & delete', danger: true, success: 'Appointment deleted' },
  REJECTED: { title: 'Reject this request?', message: 'The appointment stays in the queue.', confirm: 'Reject request', success: 'Request rejected' },
};

/** Requests tab: delete requests raised by staff for scheduled bookings; administrators decide. */
export default function DeleteRequestList() {
  const { canDo } = useAuth();
  const isApprover = canDo('APPOINTMENT_APPROVE_DELETE');
  const [filters, setFilters] = useFilters({ search: '', status: 'PENDING' });
  const query = useList(deleteRequestsApi, filters);
  const [pending, setPending] = useState(null);
  const decide = useApiMutation(({ row, status }) => deleteRequestsApi.status(row.id, status), {
    success: () => DECISIONS[pending.status].success,
    invalidate: [deleteRequestsApi.key, appointmentsApi.key, 'activity', 'dashboard'],
    onSuccess: () => setPending(null),
  });
  const decision = pending && DECISIONS[pending.status];
  const actions = (row) => isApprover && row.status === 'PENDING' && (
    <div className="flex flex-wrap justify-end gap-1">
      <Button size="sm" variant="danger" icon={Check} onClick={() => setPending({ row, status: 'APPROVED' })}>Approve</Button>
      <Button size="sm" variant="secondary" icon={X} onClick={() => setPending({ row, status: 'REJECTED' })}>Reject</Button>
    </div>
  );

  return (
    <>
      {!isApprover && <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">Bookings you asked to delete wait here until an authorised user approves or rejects them. Rejected bookings go back to the queue.</p>}
      <ResourceList
        query={query}
        columns={columns(actions)}
        toolbar={(
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SearchBar value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search patient, mobile or ID" />
            <FilterBar><FilterSelect label="Status" value={filters.status} onChange={(status) => setFilters({ status })} options={statusOptions('deleteRequest')} /></FilterBar>
          </div>
        )}
        empty={<EmptyState icon={Inbox} title={filters.status === 'PENDING' ? 'No pending delete requests' : 'No requests found'} />}
        caption="Delete requests"
        onPageChange={(page) => setFilters({ page })}
      />
      <ConfirmDialog
        open={Boolean(pending)} onClose={() => setPending(null)} onConfirm={() => decide.mutate(pending)} loading={decide.isPending}
        title={decision?.title} message={decision?.message} confirmLabel={decision?.confirm} danger={decision?.danger}
      />
    </>
  );
}

function columns(actions) {
  return [
    { key: 'token', header: 'Token', className: 'whitespace-nowrap', render: (row) => <span className="font-bold tabular-nums">{row.tokenNumber}</span> },
    { key: 'patientName', header: 'Patient', primary: true, render: (row) => <span className="font-medium text-slate-900">{row.patientName}</span> },
    { key: 'patientPhone', header: 'Mobile', className: 'whitespace-nowrap' },
    { key: 'appointment', header: 'Appointment', className: 'whitespace-nowrap', render: (row) => `${formatDate(row.appointmentDate)} · ${row.appointmentCode}` },
    { key: 'requested', header: 'Requested', render: (row) => <Who name={row.createdBy} at={row.createdAt} /> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge domain="deleteRequest" value={row.status} /> },
    { key: 'decided', header: 'Decided', hideOnMobile: true, render: (row) => (row.decidedBy ? <Who name={row.decidedBy} at={row.decidedAt} /> : '—') },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: actions },
  ];
}

function Who({ name, at }) {
  return (
    <span className="block text-sm">
      <span className="text-slate-800">{name || 'system'}</span>
      <span className="block text-xs text-slate-500">{formatDateTime(at)}</span>
    </span>
  );
}

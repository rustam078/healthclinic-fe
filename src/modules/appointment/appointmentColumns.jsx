import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatMoney, labelize } from '../../utils/format';

/**
 * Appointment columns shared by the queue, reports and patient history.
 * `nextId` marks the patient to be called next; `currency` formats the fee.
 */
export function appointmentColumns({ omit = [], actions, nextId, currency } = {}) {
  const columns = [
    { key: 'token', header: 'Token', className: 'whitespace-nowrap', render: (row) => <Token row={row} next={row.id === nextId} /> },
    { key: 'appointmentDate', header: 'Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.appointmentDate) },
    { key: 'patient', header: 'Patient', primary: true, render: (row) => <PatientCell row={row} /> },
    { key: 'patientPhone', header: 'Mobile', className: 'hidden whitespace-nowrap lg:table-cell' },
    { key: 'age', header: 'Age / sex', render: (row) => [row.patientAgeText, labelize(row.patientGender)].filter(Boolean).join(' · ') },
    { key: 'visit', header: 'Visit', render: (row) => <StatusBadge domain="visit" value={row.type} /> },
    { key: 'fee', header: 'Fee', className: 'hidden whitespace-nowrap lg:table-cell', render: (row) => (Number(row.fee) ? formatMoney(row.fee, currency) : 'Free') },
    { key: 'status', header: 'Status', render: (row) => <StatusCell row={row} /> },
  ];
  if (actions) columns.push({ key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: actions });
  return columns.filter((column) => !omit.includes(column.key));
}

function Token({ row, next }) {
  return (
    <span className="flex items-center gap-2">
      <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold text-slate-900 tabular-nums">
        {row.tokenNumber}
      </span>
      {next && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Next</span>}
    </span>
  );
}

function PatientCell({ row }) {
  return (
    <div className="min-w-0">
      <Link to={`/patients/${row.patientId}`} onClick={(event) => event.stopPropagation()} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">
        {row.patientName}
      </Link>
      <p className="text-xs text-slate-500">{row.patientCode}</p>
    </div>
  );
}

function StatusCell({ row }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      <StatusBadge domain="appointment" value={row.status} />
      {row.deletePending && <StatusBadge domain="flag" value="DELETE_PENDING" />}
    </span>
  );
}

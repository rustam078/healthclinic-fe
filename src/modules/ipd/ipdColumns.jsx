import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/format';

/** IPD admission columns shared by the IPD list, reports and patient history. */
export function ipdColumns({ omit = [], actions } = {}) {
  const columns = [
    {
      key: 'ipdCode', header: 'IPD No.', primary: true, className: 'whitespace-nowrap',
      render: (row) => (
        <Link to={`/ipd/${row.id}`} onClick={(event) => event.stopPropagation()} className="font-mono text-xs font-semibold text-brand-800 hover:underline">
          {row.ipdCode}
        </Link>
      ),
    },
    {
      key: 'patient', header: 'Patient',
      render: (row) => (
        <Link to={`/patients/${row.patientId}`} onClick={(event) => event.stopPropagation()} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">
          {row.patientName}
        </Link>
      ),
    },
    { key: 'admittedAt', header: 'Admitted', className: 'whitespace-nowrap', render: (row) => formatDateTime(row.admittedAt) },
    { key: 'bed', header: 'Room / bed', className: 'whitespace-nowrap', render: (row) => `Room ${row.roomNumber} · Bed ${row.bedNumber}` },
    {
      key: 'status', header: 'Status',
      render: (row) => (
        <Link to={`/ipd/${row.id}`} onClick={(event) => event.stopPropagation()} title="Open admission details"
          className="inline-flex rounded-full hover:opacity-80 hover:ring-2 hover:ring-brand-200 focus-visible:ring-2 focus-visible:ring-brand-400">
          <StatusBadge domain="ipd" value={row.status} />
        </Link>
      ),
    },
    { key: 'discharge', header: 'Discharge', className: 'whitespace-nowrap', render: dischargeText },
  ];
  if (actions) columns.push({ key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: actions });
  return columns.filter((column) => !omit.includes(column.key));
}

function dischargeText(row) {
  if (row.dischargedAt) return formatDate(row.dischargedAt);
  if (row.expectedDischargeDate) return <span className="text-slate-500">Expected {formatDate(row.expectedDischargeDate)}</span>;
  return <span className="text-slate-400">—</span>;
}

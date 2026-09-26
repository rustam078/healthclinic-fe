import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { formatDate, labelize } from '../../utils/format';

/** Occupied vs total beds as a meter; the track is a lighter step of the same hue. */
export function BedMeter({ beds }) {
  const total = beds.TOTAL || 0;
  const occupied = beds.OCCUPIED || 0;
  const percent = total ? Math.round((occupied / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-600">Bed occupancy</span>
        <span className="font-semibold text-slate-900 tabular-nums">{occupied} of {total} · {percent}%</span>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-teal-100" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={occupied} aria-label="Occupied beds">
        <div className="h-2.5 rounded-full bg-teal-600" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map((status) => (
          <li key={status}>{labelize(status)}: <span className="font-medium text-slate-900 tabular-nums">{beds[status] || 0}</span></li>
        ))}
      </ul>
    </div>
  );
}

/** Compact list card used for today's schedule, current admissions and recent patients. */
export function ListCard({ title, action, items, empty, render }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / LIST_PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const go = (next) => setPage(Math.min(Math.max(next, 0), pages - 1));
  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') go(current + 1);
    if (event.key === 'ArrowLeft') go(current - 1);
  };
  return (
    <Card className="flex flex-col">
      <CardHeader title={title} actions={action} />
      {items.length === 0
        ? <EmptyState title={empty} />
        : (
          <ul className="flex-1 divide-y divide-slate-100">
            {items.slice(current * LIST_PAGE_SIZE, (current + 1) * LIST_PAGE_SIZE).map((item) => <li key={item.id}>{render(item)}</li>)}
          </ul>
        )}
      {pages > 1 && <ListPager page={current} pages={pages} total={items.length} onChange={go} onKeyDown={onKeyDown} />}
    </Card>
  );
}

const LIST_PAGE_SIZE = 5;

/** Previous / next arrows for a list card (also works with the ← → keys once focused). */
function ListPager({ page, pages, total, onChange, onKeyDown }) {
  const first = page * LIST_PAGE_SIZE + 1;
  const last = Math.min(total, (page + 1) * LIST_PAGE_SIZE);
  const arrow = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 sm:px-5" onKeyDown={onKeyDown}>
      <span className="text-xs text-slate-500 tabular-nums">{first}–{last} of {total}</span>
      <div className="flex gap-2">
        <button type="button" className={arrow} onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" className={arrow} onClick={() => onChange(page + 1)} disabled={page >= pages - 1} aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function ScheduleRow({ appointment }) {
  return (
    <Link to={`/appointments?view=${appointment.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5">
      <span className="inline-flex min-w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold text-slate-900 tabular-nums">{appointment.tokenNumber}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">{appointment.patientName}</span>
        <span className="block truncate text-xs text-slate-500">{[appointment.patientAgeText, appointment.type === 'FOLLOW_UP' ? 'Follow-up' : 'Consultation'].filter(Boolean).join(' · ')}</span>
      </span>
      <StatusBadge domain="appointment" value={appointment.status} />
    </Link>
  );
}

export function AdmissionRow({ admission }) {
  return (
    <Link to={`/ipd/${admission.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">{admission.patientName}</span>
        <span className="block truncate text-xs text-slate-500">Room {admission.roomNumber} · Bed {admission.bedNumber}</span>
      </span>
      <span className="text-right text-xs text-slate-500">Day {admission.stayDays}<br />since {formatDate(admission.admittedAt)}</span>
    </Link>
  );
}

export function PatientRow({ patient }) {
  return (
    <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">{patient.fullName}</span>
        <span className="block truncate text-xs text-slate-500">{patient.patientCode} · {patient.phone}</span>
      </span>
      <span className="text-xs text-slate-500">{formatDate(patient.createdAt)}</span>
    </Link>
  );
}

export function ViewAll({ to }) {
  return <Button variant="link" size="sm" to={to}>View all</Button>;
}

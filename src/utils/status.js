import {
  Ban, BedDouble, CalendarClock, CheckCircle2, CircleDashed, Clock,
  LogOut, Repeat, Stethoscope, Trash2, UserCheck, UserX, Wrench,
} from 'lucide-react';

/**
 * Status look-up used by StatusBadge. Every status has a text label and an icon,
 * so meaning never depends on colour alone.
 */
const STATUS = {
  appointment: {
    SCHEDULED: { label: 'Waiting', tone: 'sky', icon: CalendarClock },
    COMPLETED: { label: 'Completed', tone: 'emerald', icon: CheckCircle2 },
  },
  visit: {
    CONSULTATION: { label: 'Consultation', tone: 'violet', icon: Stethoscope },
    FOLLOW_UP: { label: 'Follow-up', tone: 'teal', icon: Repeat },
  },
  deleteRequest: {
    PENDING: { label: 'Pending', tone: 'amber', icon: Clock },
    APPROVED: { label: 'Deleted', tone: 'rose', icon: Trash2 },
    REJECTED: { label: 'Rejected', tone: 'slate', icon: Ban },
  },
  flag: {
    DELETE_PENDING: { label: 'Delete requested', tone: 'rose', icon: Trash2 },
  },
  ipd: {
    ADMITTED: { label: 'Admitted', tone: 'sky', icon: BedDouble },
    DISCHARGED: { label: 'Discharged', tone: 'slate', icon: LogOut },
  },
  bed: {
    AVAILABLE: { label: 'Available', tone: 'emerald', icon: CheckCircle2 },
    OCCUPIED: { label: 'Occupied', tone: 'sky', icon: BedDouble },
    RESERVED: { label: 'Reserved', tone: 'amber', icon: Clock },
    MAINTENANCE: { label: 'Maintenance', tone: 'slate', icon: Wrench },
  },
  patient: {
    ACTIVE: { label: 'Active', tone: 'emerald', icon: UserCheck },
    INACTIVE: { label: 'Inactive', tone: 'slate', icon: UserX },
  },
  active: {
    true: { label: 'Active', tone: 'emerald', icon: CheckCircle2 },
    false: { label: 'Inactive', tone: 'slate', icon: CircleDashed },
  },
};

export function statusInfo(domain, value) {
  return STATUS[domain]?.[String(value)] || { label: String(value ?? '—'), tone: 'slate', icon: CircleDashed };
}

export function statusOptions(domain) {
  return Object.entries(STATUS[domain]).map(([value, info]) => ({ value, label: info.label }));
}

/** Tailwind classes per tone (kept literal so Tailwind can see them). */
export const TONE_CLASSES = {
  sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  rose: 'bg-rose-50 text-rose-800 ring-rose-200',
  amber: 'bg-amber-50 text-amber-900 ring-amber-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200',
};

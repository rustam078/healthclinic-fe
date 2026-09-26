import { Check, UserPlus } from 'lucide-react';
import { patientsApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { useDebounce } from '../../hooks/useDebounce';
import { labelize } from '../../utils/format';

const MIN_DIGITS = 4;

/**
 * Patients already registered with the typed mobile number (a family can share one number).
 * Choosing one fills the form; "New patient" keeps the number for a new family member.
 */
export default function PatientMatches({ phone, selectedId, onSelect, onNew }) {
  const digits = useDebounce(phone.replace(/\D/g, ''), 300);
  const query = useList(patientsApi, { search: digits, size: 10, status: 'ACTIVE' }, { enabled: digits.length >= MIN_DIGITS });
  const matches = (query.data?.content || []).filter((patient) => patient.phone.replace(/\D/g, '').includes(digits));
  if (digits.length < MIN_DIGITS || query.isPending || matches.length === 0) return null;

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
      <p className="mb-2 text-sm font-medium text-slate-800">
        {matches.length === 1 ? '1 patient' : `${matches.length} patients`} registered with this number — select one, or add a new family member
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="listbox" aria-label="Patients with this mobile number">
        {matches.map((patient) => (
          <li key={patient.id}>
            <MatchButton patient={patient} selected={patient.id === selectedId} onSelect={onSelect} />
          </li>
        ))}
        <li>
          <button type="button" role="option" aria-selected={!selectedId} onClick={onNew}
            className={`flex h-full w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm ${!selectedId ? 'border-brand-600 bg-white ring-2 ring-brand-100' : 'border-dashed border-slate-300 bg-white/70 hover:bg-white'}`}>
            <UserPlus className="size-4 shrink-0 text-brand-700" aria-hidden />
            <span className="font-medium text-slate-800">New patient with this number</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

function MatchButton({ patient, selected, onSelect }) {
  return (
    <button type="button" role="option" aria-selected={selected} onClick={() => onSelect(patient)}
      className={`flex w-full items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-left ${selected ? 'border-brand-600 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-200'}`}>
      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300'}`}>
        {selected && <Check className="size-3.5" aria-hidden />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-900">{patient.fullName}</span>
        <span className="block truncate text-xs text-slate-500">
          {labelize(patient.gender)}{patient.ageText ? ` · ${patient.ageText}` : ''} · {patient.patientCode}
        </span>
      </span>
    </button>
  );
}

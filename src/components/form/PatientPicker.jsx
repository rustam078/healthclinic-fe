import { useId, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { patientsApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PatientForm from '../../modules/patient/PatientForm';
import { controlClass } from './Fields';

/**
 * Search-as-you-type patient selector with an option to register a new patient on the spot.
 * `selected` is the chosen patient object; `onSelect(patient|null)` reports changes.
 */
export default function PatientPicker({ selected, onSelect, error, label = 'Patient', required, newPatientDefaults, disabled }) {
  const [creating, setCreating] = useState(false);
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-600" aria-hidden>*</span>}
      </label>
      {selected
        ? <SelectedPatient patient={selected} onClear={disabled ? null : () => onSelect(null)} />
        : <PatientSearch inputId={id} error={error} onSelect={onSelect} onCreate={() => setCreating(true)} />}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      <Modal open={creating} onClose={() => setCreating(false)} title="Register new patient" size="lg">
        <PatientForm compact initialValues={newPatientDefaults} onCancel={() => setCreating(false)} onSaved={(patient) => { setCreating(false); onSelect(patient); }} />
      </Modal>
    </div>
  );
}

function SelectedPatient({ patient, onClear }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{patient.fullName}</p>
        <p className="truncate text-xs text-slate-600">{patient.patientCode} · {patient.phone}</p>
      </div>
      {onClear && (
        <button type="button" onClick={onClear} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white">
          <X className="size-3.5" aria-hidden /> Change
        </button>
      )}
    </div>
  );
}

function PatientSearch({ inputId, error, onSelect, onCreate }) {
  const { can } = useAuth();
  const [text, setText] = useState('');
  const search = useDebounce(text.trim(), 300);
  const query = useList(patientsApi, { search, size: 8, status: 'ACTIVE', notAdmitted: true }, { enabled: search.length >= 2 });
  const results = search.length >= 2 ? query.data?.content || [] : [];
  const listId = `${inputId}-results`;

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" aria-hidden />
      <input
        id={inputId}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type name, mobile or patient ID"
        className={`${controlClass(error)} h-10 pl-9`}
      />
      {search.length >= 2 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {results.map((patient) => (
            <li key={patient.id} role="option" aria-selected="false">
              <button type="button" onClick={() => onSelect(patient)} className="block w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none">
                <span className="block text-sm font-medium text-slate-900">{patient.fullName}</span>
                <span className="block text-xs text-slate-500">{patient.patientCode} · {patient.phone}{patient.ageText ? ` · ${patient.ageText}` : ''}</span>
              </button>
            </li>
          ))}
          {!query.isFetching && results.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">No matching patient</li>}
          {can('PATIENT', 'WRITE') && (
            <li className="border-t border-slate-100 p-1">
              <Button variant="ghost" size="sm" icon={UserPlus} onClick={onCreate} className="w-full justify-start">Register new patient</Button>
            </li>
          )}
        </ul>
      )}
      {search.length < 2 && can('PATIENT', 'WRITE') && (
        <button type="button" onClick={onCreate} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
          <UserPlus className="size-3.5" aria-hidden /> New patient? Register here
        </button>
      )}
    </div>
  );
}

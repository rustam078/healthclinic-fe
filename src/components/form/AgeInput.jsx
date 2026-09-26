import { useEffect, useId, useRef, useState } from 'react';
import { ageParts, ageText, dobFromParts } from '../../utils/age';
import { isoDate } from '../../utils/format';
import { controlClass } from './Fields';

const EMPTY = { years: '', months: '', days: '' };
const toStrings = (parts) => (parts ? { years: String(parts.years), months: String(parts.months), days: String(parts.days) } : EMPTY);
const PARTS = [
  { key: 'years', label: 'Years', max: 120 },
  { key: 'months', label: 'Months', max: 11 },
  { key: 'days', label: 'Days', max: 30 },
];

/**
 * Date of birth OR age (years / months / days) - whichever the parent knows. Typing an age such as
 * 0 years 5 months 18 days fills the date of birth; picking a date fills the age. Both stay in sync.
 */
export default function AgeInput({ value, onChange, error }) {
  const id = useId();
  const [parts, setParts] = useState(() => toStrings(ageParts(value)));
  const emitted = useRef(value);

  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value;
      setParts(toStrings(ageParts(value)));
    }
  }, [value]);

  const emit = (dob) => { emitted.current = dob; onChange(dob); };
  const changePart = (key, raw) => {
    const next = { ...parts, [key]: raw.replace(/\D/g, '').slice(0, 3) };
    setParts(next);
    const numbers = Object.fromEntries(Object.entries(next).map(([k, v]) => [k, Number(v) || 0]));
    emit(Object.values(next).some(Boolean) ? dobFromParts(numbers) : '');
  };
  const changeDate = (dob) => { setParts(toStrings(ageParts(dob))); emit(dob); };

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-700">Date of birth or age</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input id={`${id}-dob`} type="date" aria-label="Date of birth" max={isoDate()} value={value || ''} onChange={(e) => changeDate(e.target.value)} className={`${controlClass(error)} h-10`} />
        <div className="grid grid-cols-3 gap-2 sm:w-64">
          {PARTS.map((part) => (
            <label key={part.key} className="relative block">
              <input
                type="text" inputMode="numeric" placeholder="0" value={parts[part.key]} aria-label={`Age in ${part.label.toLowerCase()}`}
                onChange={(e) => changePart(part.key, e.target.value)}
                className={`${controlClass(error)} h-10 pr-12 text-right`}
              />
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-slate-400">{part.label}</span>
            </label>
          ))}
        </div>
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p>
        : <p className="mt-1 text-xs text-slate-500">{value ? `Age: ${ageText(value)}` : 'Enter the date of birth, or the age in years, months and days'}</p>}
    </fieldset>
  );
}

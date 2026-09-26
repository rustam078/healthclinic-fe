import { useId } from 'react';

export const controlClass = (error) =>
  `block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400
   focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
    error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-100'
  }`;

/** Label + control + hint/error. Children receive the generated id and aria attributes. */
export function FormField({ label, error, hint, required, className = '', children }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-600" aria-hidden>*</span>}
        </label>
      )}
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, 'aria-required': required })}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextField({ label, error, hint, required, className, ...inputProps }) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(aria) => <input type="text" className={`${controlClass(error)} h-10`} {...aria} {...inputProps} />}
    </FormField>
  );
}

export function TextAreaField({ label, error, hint, required, className, rows = 3, ...inputProps }) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(aria) => <textarea rows={rows} className={`${controlClass(error)} py-2`} {...aria} {...inputProps} />}
    </FormField>
  );
}

/** options: [{ value, label }] or groups [{ label, options: [...] }]. */
export function SelectField({ label, error, hint, required, className, options = [], placeholder, ...selectProps }) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(aria) => (
        <select className={`${controlClass(error)} h-10 pr-8`} {...aria} {...selectProps}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (option.options ? (
            <optgroup key={option.label} label={option.label}>
              {option.options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </optgroup>
          ) : <option key={option.value} value={option.value}>{option.label}</option>))}
        </select>
      )}
    </FormField>
  );
}

/** Large tap-friendly radio buttons (e.g. Male / Female / Other); pass the register() props. */
export function SegmentedField({ label, options, error, required, name, ...radioProps }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-600" aria-hidden>*</span>}
      </legend>
      <div className={`grid gap-2 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input type="radio" value={option.value} name={name} className="peer sr-only" {...radioProps} />
            <span className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium text-slate-700 transition-colors
              peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2
              ${error ? 'border-rose-400' : 'border-slate-300 hover:bg-slate-50'}`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </fieldset>
  );
}

/**
 * Select whose options come from the server. It is only mounted (and registered with the form)
 * once options have loaded, so a pre-filled value such as the current doctor is applied correctly.
 */
export function LookupSelect({ loading, label, required, ...props }) {
  if (loading) {
    return (
      <FormField label={label} required={required}>
        {(aria) => <select disabled className={`${controlClass()} h-10`} {...aria}><option>Loading…</option></select>}
      </FormField>
    );
  }
  return <SelectField label={label} required={required} {...props} />;
}

export function CheckboxField({ label, hint, className = '', ...inputProps }) {
  const id = useId();
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <input id={id} type="checkbox" className="mt-0.5 size-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600" {...inputProps} />
      <label htmlFor={id} className="text-sm text-slate-700">
        {label}
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </label>
    </div>
  );
}

/** Responsive form grid: one column on phones, two (or three) on larger screens. */
export function FormGrid({ columns = 2, children }) {
  const grid = columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';
  return <div className={`grid grid-cols-1 gap-4 ${grid}`}>{children}</div>;
}

export function FormSection({ title, description, children }) {
  return (
    <fieldset className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
      <legend className="mb-1 text-sm font-semibold text-slate-900">{title}</legend>
      {description && <p className="mb-4 text-sm text-slate-500">{description}</p>}
      <div className={description ? '' : 'mt-3'}>{children}</div>
    </fieldset>
  );
}

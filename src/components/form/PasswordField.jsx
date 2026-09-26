import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FormField, controlClass } from './Fields';

/** Password input with a show/hide (eye) button. */
export default function PasswordField({ label, error, hint, required, className, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(aria) => (
        <div className="relative">
          <input type={visible ? 'text' : 'password'} className={`${controlClass(error)} h-10 pr-10`} {...aria} {...inputProps} />
          <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <Icon className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </FormField>
  );
}

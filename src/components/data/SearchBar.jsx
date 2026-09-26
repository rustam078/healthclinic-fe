import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

/** Debounced search box; reports the value after the user pauses typing. */
export default function SearchBar({ value = '', onChange, placeholder = 'Search…', className = '' }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text);

  useEffect(() => { setText(value); }, [value]);
  useEffect(() => { if (debounced !== value) onChange(debounced); }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative w-full sm:max-w-xs ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-9 pl-9 text-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button type="button" onClick={() => setText('')} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

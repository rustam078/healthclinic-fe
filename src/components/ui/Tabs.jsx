import { useSearchParams } from 'react-router-dom';

/** Reads/writes the active tab in the URL (?tab=...) so tabs are linkable and survive refresh. */
export function useTab(tabs, param = 'tab') {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get(param);
  const active = tabs.some((tab) => tab.id === requested) ? requested : tabs[0].id;
  const setActive = (id) => setSearchParams({ [param]: id }, { replace: true });
  return [active, setActive];
}

/** Horizontally scrollable tab bar (works on phones). */
export default function Tabs({ tabs, active, onChange, label }) {
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label={label} className="flex min-w-max gap-1 border-b border-slate-200">
        {tabs.map(({ id, label: text, icon: Icon, count }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                selected ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {Icon && <Icon className="size-4" aria-hidden />}
              {text}
              {count > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-xs text-amber-900">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

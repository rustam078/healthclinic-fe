import { useSearchParams } from 'react-router-dom';

/** Reads/writes the active tab in the URL (?tab=...) so tabs are linkable and survive refresh. */
export function useTab(tabs, param = 'tab') {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get(param);
  const active = tabs.some((tab) => tab.id === requested) ? requested : tabs[0].id;
  const setActive = (id) => setSearchParams({ [param]: id }, { replace: true });
  return [active, setActive];
}

const BADGE = {
  attention: 'bg-amber-100 text-amber-900',
  info: 'bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100',
};

/**
 * Horizontally scrollable tab bar (works on phones). A tab can show a count badge: tone "attention" (default,
 * amber, hidden when 0) for things waiting for action, or "info" (teal, also shows 0) for a plain total.
 */
export default function Tabs({ tabs, active, onChange, label }) {
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label={label} className="flex min-w-max gap-1 border-b border-slate-200">
        {tabs.map(({ id, label: text, icon: Icon, count, tone = 'attention' }) => {
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
              {(count > 0 || (tone === 'info' && count != null)) && (
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${BADGE[tone] || BADGE.attention}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

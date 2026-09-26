import { CalendarDays, ChevronDown, MoveRight } from 'lucide-react';
import { usePopover } from '../../components/ui/usePopover';
import { monthRange } from '../../utils/format';
import { PERIODS, periodLabel, rangeText } from './dashboardPeriod';

const inputClass = 'h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 '
  + 'focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none';

/**
 * One fixed-size button showing the chosen period; it opens a panel with quick ranges, a particular month and a
 * custom date range. The page layout never moves when the period changes.
 */
export default function PeriodPicker({ filters, setFilters, range }) {
  const { open, setOpen, ref } = usePopover();
  const choose = (changes) => {
    setFilters(changes);
    setOpen(false);
  };
  return (
    <div ref={ref} className="relative w-full sm:w-80">
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="dialog" aria-expanded={open}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm shadow-sm hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-brand-400 pointer-coarse:h-11">
        <CalendarDays className="size-4 shrink-0 text-brand-700" aria-hidden />
        <span className="shrink-0 font-medium text-slate-900">{periodLabel(filters.period, range)}</span>
        <span className="min-w-0 flex-1 truncate text-slate-500">{rangeText(range)}</span>
        <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <PeriodPanel filters={filters} range={range} setFilters={setFilters} choose={choose} />}
    </div>
  );
}

function PeriodPanel({ filters, range, setFilters, choose }) {
  const custom = (changes) => setFilters({ period: 'custom', from: range.from, to: range.to, ...changes });
  return (
    <div role="dialog" aria-label="Choose period"
      className="absolute top-full right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <Section title="Quick ranges">
        <div className="grid grid-cols-2 gap-2">
          {PERIODS.map((period) => (
            <button key={period.id} type="button" aria-pressed={filters.period === period.id}
              onClick={() => choose({ period: period.id, from: '', to: '' })}
              className={`h-9 rounded-lg border px-2 text-sm font-medium pointer-coarse:h-11 ${filters.period === period.id
                ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 text-slate-700 hover:border-brand-600 hover:bg-brand-50'}`}>
              {period.label}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Particular month" divided>
        <input type="month" aria-label="Month" className={inputClass} value={filters.period === 'custom' ? range.from.slice(0, 7) : ''}
          onChange={(event) => event.target.value && choose({ period: 'custom', ...monthRange(new Date(`${event.target.value}-01T00:00`)) })} />
      </Section>
      <Section title="Custom date range" divided>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <input type="date" aria-label="Start date" className={inputClass} value={range.from} max={range.to}
            onChange={(event) => event.target.value && custom({ from: event.target.value })} />
          <MoveRight className="size-4 text-slate-400" aria-hidden />
          <input type="date" aria-label="End date" className={inputClass} value={range.to} min={range.from}
            onChange={(event) => event.target.value && custom({ to: event.target.value })} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, divided, children }) {
  return (
    <section className={divided ? 'border-t border-slate-100 pt-4' : ''}>
      <h3 className="mb-2 text-sm font-semibold text-slate-600">{title}</h3>
      {children}
    </section>
  );
}

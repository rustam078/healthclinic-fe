import { addDays, formatDate, isoDate, monthRange } from '../../utils/format';

/** Monday-to-Sunday of the week containing the given day. */
function weekRange(day = new Date()) {
  const offset = (day.getDay() + 6) % 7;
  const monday = addDays(-offset, day);
  return { from: isoDate(monday), to: isoDate(addDays(6, monday)) };
}

function lastMonth() {
  const today = new Date();
  return monthRange(new Date(today.getFullYear(), today.getMonth() - 1, 1));
}

function thisQuarter() {
  const today = new Date();
  const first = Math.floor(today.getMonth() / 3) * 3;
  return {
    from: isoDate(new Date(today.getFullYear(), first, 1)),
    to: isoDate(new Date(today.getFullYear(), first + 3, 0)),
  };
}

function thisYear() {
  const year = new Date().getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

const day = (offset) => () => ({ from: isoDate(addDays(offset)), to: isoDate(addDays(offset)) });

/** Quick ranges shown as buttons in the period picker. */
export const PERIODS = [
  { id: 'today', label: 'Today', range: day(0) },
  { id: 'yesterday', label: 'Yesterday', range: day(-1) },
  { id: 'week', label: 'This week', range: () => weekRange() },
  { id: 'lastWeek', label: 'Last week', range: () => weekRange(addDays(-7)) },
  { id: 'month', label: 'This month', range: () => monthRange() },
  { id: 'lastMonth', label: 'Last month', range: lastMonth },
  { id: 'quarter', label: 'This quarter', range: thisQuarter },
  { id: 'year', label: 'This year', range: thisYear },
];

/** Resolves the selected period (or custom from/to) into concrete dates. */
export function resolvePeriod({ period, from, to }) {
  const preset = PERIODS.find((item) => item.id === period);
  if (preset) return preset.range();
  return { from: from || isoDate(), to: to || from || isoDate() };
}

/** "Today", "This month", "August 2026" (a whole month) or "Custom dates". */
export function periodLabel(period, range) {
  const preset = PERIODS.find((item) => item.id === period);
  if (preset) return preset.label;
  const whole = monthRange(new Date(`${range.from}T00:00`));
  if (whole.from === range.from && whole.to === range.to) {
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(`${range.from}T00:00`));
  }
  return 'Custom dates';
}

export function rangeText({ from, to }) {
  return from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`;
}

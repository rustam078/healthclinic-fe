import { addDays, isoDate, monthRange } from '../../utils/format';

/** Monday-to-Sunday of the current week. */
function weekRange(today = new Date()) {
  const offset = (today.getDay() + 6) % 7;
  const monday = addDays(-offset, today);
  return { from: isoDate(monday), to: isoDate(addDays(6, monday)) };
}

export const PERIODS = [
  { id: 'today', label: 'Today', range: () => ({ from: isoDate(), to: isoDate() }) },
  { id: 'week', label: 'This week', range: weekRange },
  { id: 'month', label: 'This month', range: () => monthRange() },
  { id: 'custom', label: 'Custom' },
];

/** Resolves the selected period (or custom from/to) into concrete dates. */
export function resolvePeriod({ period, from, to }) {
  const preset = PERIODS.find((item) => item.id === period && item.range);
  if (preset) return preset.range();
  return { from: from || isoDate(), to: to || from || isoDate() };
}

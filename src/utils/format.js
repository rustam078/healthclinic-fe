const dateFormat = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

/** Parses backend values: "2026-09-26", "10:30:00" or "2026-09-26T10:30:00". */
function toDate(value) {
  if (!value) return null;
  if (/^\d{2}:\d{2}/.test(value)) return new Date(`1970-01-01T${value}`);
  return new Date(value.length === 10 ? `${value}T00:00:00` : value);
}

export function formatDate(value) {
  const date = toDate(value);
  return date ? dateFormat.format(date) : '—';
}

export function formatTime(value) {
  const date = toDate(value);
  return date ? timeFormat.format(date) : '—';
}

export function formatDateTime(value) {
  const date = toDate(value);
  return date ? `${dateFormat.format(date)}, ${timeFormat.format(date)}` : '—';
}

export function formatMoney(amount, symbol = '₹') {
  if (amount === null || amount === undefined) return '—';
  return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/** SEMI_PRIVATE -> "Semi private". */
/** A made-up 10-digit Indian mobile number (starts with 6-9), for families who do not want to share theirs. */
export function randomIndianMobile() {
  const rest = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  return String(6 + Math.floor(Math.random() * 4)) + rest;
}

/** Short exact age from a date of birth, e.g. "3y 2m 5d" (zero parts left out). */
export function shortAge(dateOfBirth, today = new Date()) {
  if (!dateOfBirth) return '';
  const [y, m, d] = dateOfBirth.split('-').map(Number);
  let years = today.getFullYear() - y;
  let months = today.getMonth() + 1 - m;
  let days = today.getDate() - d;
  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts = [[years, 'y'], [months, 'm'], [days, 'd']].filter(([n]) => n > 0).map(([n, u]) => `${n}${u}`);
  return parts.length ? parts.join(' ') : '0d';
}

export function labelize(value) {
  if (!value) return '—';
  const text = String(value).replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function displayOrDash(value) {
  return value === null || value === undefined || value === '' ? '—' : value;
}

/** yyyy-mm-dd in local time (for <input type="date"> and API filters). */
export function isoDate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** yyyy-mm-ddThh:mm in local time (for <input type="datetime-local">). */
export function isoDateTime(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function addDays(days, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

/** First and last day of the current month (default report period). */
export function monthRange(date = new Date()) {
  return {
    from: isoDate(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: isoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

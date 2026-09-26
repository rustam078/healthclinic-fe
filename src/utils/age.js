import { isoDate } from './format';

/** Years, months and days between a date of birth (yyyy-mm-dd) and today; null if not valid. */
export function ageParts(dateOfBirth, today = new Date()) {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return years < 0 ? null : { years, months, days };
}

/** Date of birth from an age such as "5 months 18 days" or "1 year 6 months". */
export function dobFromParts({ years = 0, months = 0, days = 0 }) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(date.getMonth() - months);
  date.setDate(date.getDate() - days);
  return isoDate(date);
}

const unit = (value, word) => `${value} ${word}${value === 1 ? '' : 's'}`;

/** Same wording as the server: "12 days", "5 months 18 days", "1 year 6 months", "7 years". */
export function ageText(dateOfBirth) {
  const parts = ageParts(dateOfBirth);
  if (!parts) return '';
  const { years, months, days } = parts;
  if (years >= 5) return unit(years, 'year');
  if (years >= 1) return months ? `${unit(years, 'year')} ${unit(months, 'month')}` : unit(years, 'year');
  if (months >= 1) return days ? `${unit(months, 'month')} ${unit(days, 'day')}` : unit(months, 'month');
  return unit(days, 'day');
}

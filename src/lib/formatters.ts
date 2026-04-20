import { HEBREW_MONTHS } from './constants';

/** Format a number as ILS currency — e.g. ₪1,234,567 */
export function formatILS(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** Format a percentage — e.g. 3.5% */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format a "YYYY-MM" key as a Hebrew month string — e.g. "ינואר 2025" */
export function formatHebrewMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return `${HEBREW_MONTHS[month - 1]} ${year}`;
}

/** Format a change value with sign and colour class — for display logic */
export function getChangeSign(value: number): '+' | '-' | '' {
  if (value > 0) return '+';
  if (value < 0) return '-';
  return '';
}

/** Format absolute change with sign — e.g. "+₪12,000" or "-₪3,000" */
export function formatChangeILS(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatILS(change)}`;
}

/** Return Tailwind text colour class based on positive/negative value */
export function changeColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-slate-400';
}

/** Format an ISO date string as a Hebrew-friendly date — e.g. "15 ינואר 2025" */
export function formatHebrewDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = HEBREW_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Parse "YYYY-MM" to a Date object (first of that month) */
export function parseYearMonth(yearMonth: string): Date {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

/** Get current month as "YYYY-MM" */
export function currentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/** Get previous month as "YYYY-MM" */
export function previousYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, '0')}`;
}

/** Days until a date (positive = future, negative = past) */
export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

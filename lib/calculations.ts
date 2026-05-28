import { DrinkEntry } from './types';

export function calcStandardDrinks(ounces: number, abv: number, quantity: number = 1): number {
  const sd = (ounces * (abv / 100)) / 0.6;
  return Math.round(sd * quantity * 100) / 100;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekKey(weekStart: Date): string {
  const year = weekStart.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil((((weekStart.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getEntriesForDay(entries: DrinkEntry[], dateStr: string): DrinkEntry[] {
  return entries.filter(e => e.date === dateStr);
}

export function getDayTotal(entries: DrinkEntry[], dateStr: string): number {
  return getEntriesForDay(entries, dateStr).reduce((sum, e) => sum + e.standardDrinks, 0);
}

export function getWeekTotal(entries: DrinkEntry[], weekDays: Date[]): number {
  return weekDays.reduce((sum, day) => sum + getDayTotal(entries, formatDate(day)), 0);
}

export function getDrinkingDaysCount(entries: DrinkEntry[], weekDays: Date[]): number {
  return weekDays.filter(day => getDayTotal(entries, formatDate(day)) > 0).length;
}

export function getHighestDay(entries: DrinkEntry[], weekDays: Date[]): { date: string; total: number } | null {
  let max = { date: '', total: 0 };
  for (const day of weekDays) {
    const dateStr = formatDate(day);
    const total = getDayTotal(entries, dateStr);
    if (total > max.total) max = { date: dateStr, total };
  }
  return max.total > 0 ? max : null;
}

export function getDayColor(total: number): string {
  if (total === 0) return 'empty';
  if (total <= 1) return 'low';
  if (total <= 3) return 'moderate';
  if (total <= 5) return 'high';
  return 'very-high';
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

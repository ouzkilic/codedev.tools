import type { ToolLogic } from '@/hooks/useToolState';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const current = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((current - start) / 86400000) + 1;
}

function isoWeek(d: Date): number {
  const target = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  // ISO: Thursday determines the year/week.
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = Date.UTC(target.getUTCFullYear(), 0, 4);
  const firstThursdayDate = new Date(firstThursday);
  const firstDayNum = (firstThursdayDate.getUTCDay() + 6) % 7;
  firstThursdayDate.setUTCDate(firstThursdayDate.getUTCDate() - firstDayNum + 3);
  return (
    1 +
    Math.round(
      (target.getTime() - firstThursdayDate.getTime()) / (7 * 86400000),
    )
  );
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export const dateInfoLogic: ToolLogic = {
  transform(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Enter a date.');
    }
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) {
      throw new Error('Invalid date.');
    }
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const quarter = Math.floor(month / 3) + 1;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    return [
      'Weekday:     ' + WEEKDAYS[d.getUTCDay()],
      'Day of year: ' + dayOfYear(d),
      'ISO week:    ' + isoWeek(d),
      'Quarter:     Q' + quarter,
      'Leap year:   ' + (isLeapYear(year) ? 'yes' : 'no'),
      'Days in month: ' + daysInMonth,
    ].join('\n');
  },
};

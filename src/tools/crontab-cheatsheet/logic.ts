import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const CRON_OPTIONS: ToolOption[] = [
  { key: 'filter', label: 'Search', type: 'text', default: '', placeholder: 'Filter the cheatsheet...' },
];

const LINES: string[] = [
  '# Field layout',
  '* * * * *  minute hour day-of-month month day-of-week',
  'minute        0-59',
  'hour          0-23',
  'day-of-month  1-31',
  'month         1-12 (or JAN-DEC)',
  'day-of-week   0-6 (0 = Sunday, or SUN-SAT)',
  '',
  '# Operators',
  '*    any value',
  ',    value list separator (1,15,30)',
  '-    range of values (1-5)',
  '/    step values (*/5)',
  '',
  '# Special strings',
  '@reboot   run once at startup',
  '@hourly   run once an hour (0 * * * *)',
  '@daily    run once a day at midnight (0 0 * * *)',
  '@weekly   run once a week, Sunday midnight (0 0 * * 0)',
  '@monthly  run once a month, first day midnight (0 0 1 * *)',
  '@yearly   run once a year, Jan 1st midnight (0 0 1 1 *)',
  '',
  '# Common examples',
  '0 0 * * *      every day at midnight',
  '*/5 * * * *    every 5 minutes',
  '*/15 * * * *   every 15 minutes',
  '0 * * * *      every hour on the hour',
  '0 9 * * 1-5    weekdays at 9am',
  '0 0 1 * *      first of month at midnight',
  '0 0 * * 0      every Sunday at midnight',
  '30 2 * * *     every day at 2:30am',
  '0 12 * * *     every day at noon',
  '0 0 1 1 *      every January 1st at midnight',
];

export function buildCron(options: ToolOptions): string {
  const q = String(options.filter ?? '').trim().toLowerCase();
  if (!q) return LINES.join('\n');
  return LINES.filter((line) => line.toLowerCase().includes(q)).join('\n');
}

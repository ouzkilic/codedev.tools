import { describe, it, expect } from 'vitest';
import { cronLogic } from './logic';

describe('cron', () => {
  // --- happy paths: standard 5-field expressions ---
  it('explains a daily-at-midnight expression', () => {
    expect(cronLogic.transform('0 0 * * *')).toBe('At 12:00 AM');
  });

  it('explains an interval expression', () => {
    expect(cronLogic.transform('*/5 * * * *')).toBe('Every 5 minutes');
  });

  it('explains every-minute (all wildcards)', () => {
    expect(cronLogic.transform('* * * * *')).toBe('Every minute');
  });

  it('explains a weekday-noon expression with a day-of-week range', () => {
    expect(cronLogic.transform('0 12 * * 1-5')).toBe(
      'At 12:00 PM, Monday through Friday',
    );
  });

  it('explains a monthly day-of-month expression', () => {
    expect(cronLogic.transform('0 0 1 * *')).toBe(
      'At 12:00 AM, on day 1 of the month',
    );
  });

  it('explains a single weekday with a specific time', () => {
    expect(cronLogic.transform('30 9 * * 1')).toBe(
      'At 09:30 AM, only on Monday',
    );
  });

  it('explains a comma list of hours', () => {
    expect(cronLogic.transform('0 0,12 * * *')).toBe(
      'At 12:00 AM and 12:00 PM',
    );
  });

  it('explains a day-of-month + month combination', () => {
    expect(cronLogic.transform('0 0 1 1 *')).toBe(
      'At 12:00 AM, on day 1 of the month, only in January',
    );
  });

  it('explains a stepped hour range', () => {
    expect(cronLogic.transform('23 0-20/2 * * *')).toBe(
      'At 23 minutes past the hour, every 2 hours, between 12:00 AM and 08:59 PM',
    );
  });

  it('explains a comma list of weekdays', () => {
    expect(cronLogic.transform('0 0 * * 1,3,5')).toBe(
      'At 12:00 AM, only on Monday, Wednesday, and Friday',
    );
  });

  it('accepts a named day-of-week (sun)', () => {
    expect(cronLogic.transform('5 4 * * sun')).toBe(
      'At 04:05 AM, only on Sunday',
    );
  });

  it('explains an hour range as "between"', () => {
    expect(cronLogic.transform('0 9-17 * * *')).toBe(
      'Every hour, between 09:00 AM and 05:00 PM',
    );
  });

  it('explains a stepped day-of-month interval', () => {
    expect(cronLogic.transform('0 0 */15 * *')).toBe(
      'At 12:00 AM, every 15 days in a month',
    );
  });

  // --- 6-field (with seconds) form ---
  it('accepts a 6-field expression with a seconds column', () => {
    expect(cronLogic.transform('0 0 0 * * *')).toBe('At 12:00 AM');
  });

  // --- macros / aliases ---
  it('expands @yearly', () => {
    expect(cronLogic.transform('@yearly')).toBe(
      'At 12:00 AM, on day 1 of the month, only in January',
    );
  });

  it('expands @daily', () => {
    expect(cronLogic.transform('@daily')).toBe('At 12:00 AM');
  });

  it('expands @hourly', () => {
    expect(cronLogic.transform('@hourly')).toBe('Every hour');
  });

  it('expands @weekly', () => {
    expect(cronLogic.transform('@weekly')).toBe('At 12:00 AM, only on Sunday');
  });

  it('expands @monthly', () => {
    expect(cronLogic.transform('@monthly')).toBe(
      'At 12:00 AM, on day 1 of the month',
    );
  });

  it('handles @reboot', () => {
    expect(cronLogic.transform('@reboot')).toBe('Run once, at startup');
  });

  // --- trimming behaviour (logic.ts calls input.trim()) ---
  it('trims surrounding whitespace before parsing', () => {
    expect(cronLogic.transform('  0 0 * * *  ')).toBe('At 12:00 AM');
  });

  it('trims surrounding tabs before parsing', () => {
    expect(cronLogic.transform('\t0 0 * * *\t')).toBe('At 12:00 AM');
  });

  // --- determinism ---
  it('is deterministic for the same input', () => {
    const a = cronLogic.transform('*/5 * * * *');
    const b = cronLogic.transform('*/5 * * * *');
    expect(a).toBe(b);
  });

  // --- error paths ---
  it('throws on a non-cron string', () => {
    expect(() => cronLogic.transform('not a cron')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => cronLogic.transform('')).toThrow();
  });

  it('throws on a whitespace-only string', () => {
    expect(() => cronLogic.transform('   ')).toThrow();
  });

  it('throws on too few fields', () => {
    expect(() => cronLogic.transform('* *')).toThrow();
  });

  it('throws on too many fields', () => {
    expect(() => cronLogic.transform('1 2 3 4 5 6 7 8')).toThrow();
  });

  it('throws on an out-of-range minute value', () => {
    expect(() => cronLogic.transform('99 * * * *')).toThrow();
  });

  it('throws on emoji / unicode garbage in a field', () => {
    expect(() => cronLogic.transform('😀 * * * *')).toThrow();
  });
});

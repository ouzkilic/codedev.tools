import { describe, it, expect } from 'vitest';
import { dateInfoLogic } from './logic';

describe('dateInfoLogic.transform', () => {
  it('reports full info for 2024-01-01', () => {
    const out = dateInfoLogic.transform('2024-01-01');
    expect(out).toContain('Weekday:     Monday');
    expect(out).toContain('Day of year: 1');
    expect(out).toContain('ISO week:    1');
    expect(out).toContain('Quarter:     Q1');
    expect(out).toContain('Leap year:   yes');
    expect(out).toContain('Days in month: 31');
  });

  it('reports Sunday for 2023-12-31', () => {
    const out = dateInfoLogic.transform('2023-12-31');
    expect(out).toContain('Weekday:     Sunday');
    expect(out).toContain('Day of year: 365');
    expect(out).toContain('ISO week:    52');
    expect(out).toContain('Quarter:     Q4');
    expect(out).toContain('Leap year:   no');
  });

  it('computes day of year and days in month for 2023-03-15', () => {
    const out = dateInfoLogic.transform('2023-03-15');
    expect(out).toContain('Weekday:     Wednesday');
    expect(out).toContain('Day of year: 74');
    expect(out).toContain('ISO week:    11');
    expect(out).toContain('Quarter:     Q1');
    expect(out).toContain('Days in month: 31');
  });

  it('puts October in Q4 with 31 days', () => {
    const out = dateInfoLogic.transform('2022-10-10');
    expect(out).toContain('Weekday:     Monday');
    expect(out).toContain('Day of year: 283');
    expect(out).toContain('ISO week:    41');
    expect(out).toContain('Quarter:     Q4');
    expect(out).toContain('Days in month: 31');
  });

  it('handles ISO week rollover for 2021-01-04', () => {
    const out = dateInfoLogic.transform('2021-01-04');
    expect(out).toContain('ISO week:    1');
    expect(out).toContain('Day of year: 4');
    expect(out).toContain('Weekday:     Monday');
  });

  // --- Quarter boundaries: one date per quarter ---
  it('classifies a Q1 date (January) correctly', () => {
    expect(dateInfoLogic.transform('2023-01-01')).toContain('Quarter:     Q1');
  });

  it('classifies a Q2 date (June) with 30 days', () => {
    const out = dateInfoLogic.transform('2024-06-01');
    expect(out).toContain('Quarter:     Q2');
    expect(out).toContain('Days in month: 30');
    expect(out).toContain('Weekday:     Saturday');
    expect(out).toContain('Day of year: 153');
    expect(out).toContain('ISO week:    22');
  });

  it('classifies a Q3 date (July) correctly', () => {
    const out = dateInfoLogic.transform('2024-07-15');
    expect(out).toContain('Quarter:     Q3');
    expect(out).toContain('Day of year: 197');
    expect(out).toContain('ISO week:    29');
  });

  it('classifies a Q4 date (December) correctly', () => {
    expect(dateInfoLogic.transform('2024-12-31')).toContain('Quarter:     Q4');
  });

  // --- Leap year rules ---
  it('treats year divisible by 4 as leap (Feb has 29 days)', () => {
    const out = dateInfoLogic.transform('2020-02-29');
    expect(out).toContain('Leap year:   yes');
    expect(out).toContain('Days in month: 29');
    expect(out).toContain('Day of year: 60');
    expect(out).toContain('Weekday:     Saturday');
  });

  it('treats year divisible by 400 as leap (2000)', () => {
    const out = dateInfoLogic.transform('2000-02-29');
    expect(out).toContain('Leap year:   yes');
    expect(out).toContain('Days in month: 29');
    expect(out).toContain('Weekday:     Tuesday');
  });

  it('treats century year not divisible by 400 as non-leap (1900)', () => {
    // 1900 % 100 === 0 but 1900 % 400 !== 0 -> not a leap year
    const out = dateInfoLogic.transform('1900-03-01');
    expect(out).toContain('Leap year:   no');
    // March 1900 still has 31 days regardless
    expect(out).toContain('Days in month: 31');
  });

  it('reports day 366 for the last day of a leap year', () => {
    const out = dateInfoLogic.transform('2020-12-31');
    expect(out).toContain('Day of year: 366');
    expect(out).toContain('Leap year:   yes');
    expect(out).toContain('ISO week:    53');
    expect(out).toContain('Weekday:     Thursday');
  });

  // --- ISO week edge cases (week belongs to neighbouring year) ---
  it('places 2019-12-30 in ISO week 1 (of the following ISO year)', () => {
    const out = dateInfoLogic.transform('2019-12-30');
    expect(out).toContain('ISO week:    1');
    expect(out).toContain('Day of year: 364');
  });

  it('places 2016-01-01 in ISO week 53 (of the previous ISO year)', () => {
    const out = dateInfoLogic.transform('2016-01-01');
    expect(out).toContain('ISO week:    53');
    expect(out).toContain('Day of year: 1');
    expect(out).toContain('Weekday:     Friday');
  });

  it('places 2024-12-31 in ISO week 1 of the next ISO year', () => {
    const out = dateInfoLogic.transform('2024-12-31');
    expect(out).toContain('ISO week:    1');
    expect(out).toContain('Day of year: 366');
  });

  // --- Each weekday name reachable ---
  it('reports each weekday name across a consecutive week', () => {
    // 2024-01-01 is Monday ... 2024-01-07 is Sunday
    expect(dateInfoLogic.transform('2024-01-01')).toContain(
      'Weekday:     Monday',
    );
    expect(dateInfoLogic.transform('2024-01-02')).toContain(
      'Weekday:     Tuesday',
    );
    expect(dateInfoLogic.transform('2024-01-03')).toContain(
      'Weekday:     Wednesday',
    );
    expect(dateInfoLogic.transform('2024-01-04')).toContain(
      'Weekday:     Thursday',
    );
    expect(dateInfoLogic.transform('2024-01-05')).toContain(
      'Weekday:     Friday',
    );
    expect(dateInfoLogic.transform('2024-01-06')).toContain(
      'Weekday:     Saturday',
    );
    expect(dateInfoLogic.transform('2024-01-07')).toContain(
      'Weekday:     Sunday',
    );
  });

  // --- Input format handling ---
  it('accepts a full ISO timestamp with UTC zone', () => {
    const out = dateInfoLogic.transform('2024-07-15T12:00:00Z');
    expect(out).toContain('Weekday:     Monday');
    expect(out).toContain('Day of year: 197');
    expect(out).toContain('Quarter:     Q3');
  });

  it('trims surrounding whitespace before parsing', () => {
    const padded = dateInfoLogic.transform('   2024-01-01   ');
    const clean = dateInfoLogic.transform('2024-01-01');
    expect(padded).toBe(clean);
  });

  // --- Output shape / determinism ---
  it('produces exactly six labelled lines', () => {
    const lines = dateInfoLogic.transform('2024-01-01').split('\n');
    expect(lines).toHaveLength(6);
    expect(lines[0].startsWith('Weekday:')).toBe(true);
    expect(lines[1].startsWith('Day of year:')).toBe(true);
    expect(lines[2].startsWith('ISO week:')).toBe(true);
    expect(lines[3].startsWith('Quarter:')).toBe(true);
    expect(lines[4].startsWith('Leap year:')).toBe(true);
    expect(lines[5].startsWith('Days in month:')).toBe(true);
  });

  it('is deterministic for the same input', () => {
    expect(dateInfoLogic.transform('2023-03-15')).toBe(
      dateInfoLogic.transform('2023-03-15'),
    );
  });

  it('always reports a quarter in the Q1..Q4 range', () => {
    for (const m of ['01', '03', '04', '06', '07', '09', '10', '12']) {
      const out = dateInfoLogic.transform(`2024-${m}-10`);
      expect(out).toMatch(/Quarter: {5}Q[1-4]/);
    }
  });

  // --- Error paths ---
  it('throws "Enter a date." on empty input', () => {
    expect(() => dateInfoLogic.transform('')).toThrow('Enter a date.');
  });

  it('throws "Enter a date." on whitespace-only input', () => {
    expect(() => dateInfoLogic.transform('   \t  \n ')).toThrow('Enter a date.');
  });

  it('throws "Invalid date." on a non-date string', () => {
    expect(() => dateInfoLogic.transform('not a date')).toThrow(
      'Invalid date.',
    );
  });

  it('throws on a single invalid character', () => {
    expect(() => dateInfoLogic.transform('x')).toThrow();
  });

  it('throws on an emoji input', () => {
    expect(() => dateInfoLogic.transform('🎉')).toThrow('Invalid date.');
  });

  it('throws on an out-of-range ISO month (2024-13-01)', () => {
    expect(() => dateInfoLogic.transform('2024-13-01')).toThrow(
      'Invalid date.',
    );
  });
});

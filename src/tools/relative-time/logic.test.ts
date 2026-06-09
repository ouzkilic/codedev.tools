import { describe, expect, it } from 'vitest';
import { relativeTime, relativeTimeLogic } from './logic';

// Helper: build a `now` and offset it by a number of seconds to get `date`.
const NOW = new Date('2024-06-15T12:00:00Z');
const at = (offsetSeconds: number) => new Date(NOW.getTime() + offsetSeconds * 1000);

describe('relativeTime — direction', () => {
  it('formats a future date one day ahead', () => {
    const date = new Date('2024-01-02T00:00:00Z');
    const now = new Date('2024-01-01T00:00:00Z');
    expect(relativeTime(date, now)).toBe('in 1 day');
  });

  it('formats a past date one day ago', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const now = new Date('2024-01-02T00:00:00Z');
    expect(relativeTime(date, now)).toBe('1 day ago');
  });

  it('uses "in" prefix for any future offset', () => {
    expect(relativeTime(at(3600), NOW)).toMatch(/^in /);
  });

  it('uses "ago" suffix for any past offset', () => {
    expect(relativeTime(at(-3600), NOW)).toMatch(/ ago$/);
  });
});

describe('relativeTime — second unit', () => {
  it('formats positive seconds', () => {
    expect(relativeTime(at(30), NOW)).toBe('in 30 seconds');
  });

  it('formats negative seconds', () => {
    expect(relativeTime(at(-30), NOW)).toBe('30 seconds ago');
  });

  it('formats exactly 1 second (singular)', () => {
    expect(relativeTime(at(1), NOW)).toBe('in 1 second');
  });

  it('formats 59 seconds as seconds (below minute threshold)', () => {
    expect(relativeTime(at(59), NOW)).toBe('in 59 seconds');
  });

  it('formats a zero diff as "in 0 seconds" with numeric:always', () => {
    expect(relativeTime(NOW, NOW)).toBe('in 0 seconds');
  });

  it('rounds a sub-second future diff down to 0 seconds', () => {
    // abs(0.4) < 1 so it falls back to the seconds unit; round(0.4) === 0
    expect(relativeTime(at(0.4), NOW)).toBe('in 0 seconds');
  });

  it('treats a tiny negative diff as "0 seconds ago"', () => {
    expect(relativeTime(at(-0.4), NOW)).toBe('0 seconds ago');
  });
});

describe('relativeTime — minute unit', () => {
  it('formats exactly 60 seconds as 1 minute', () => {
    expect(relativeTime(at(60), NOW)).toBe('in 1 minute');
  });

  it('rounds 90 seconds up to 2 minutes (Math.round 1.5 -> 2)', () => {
    expect(relativeTime(at(90), NOW)).toBe('in 2 minutes');
  });

  it('formats a past minute span', () => {
    expect(relativeTime(at(-120), NOW)).toBe('2 minutes ago');
  });
});

describe('relativeTime — hour unit', () => {
  it('formats just below an hour as minutes (3599s -> 60 minutes)', () => {
    // 3599 < 3600 so the minute unit is selected; round(3599/60) === 60
    expect(relativeTime(at(3599), NOW)).toBe('in 60 minutes');
  });

  it('formats exactly one hour', () => {
    expect(relativeTime(at(3600), NOW)).toBe('in 1 hour');
  });

  it('formats a multi-hour past span', () => {
    expect(relativeTime(at(-3 * 3600), NOW)).toBe('3 hours ago');
  });
});

describe('relativeTime — day / week / month / year units', () => {
  it('formats exactly one day', () => {
    expect(relativeTime(at(86400), NOW)).toBe('in 1 day');
  });

  it('formats exactly one week', () => {
    expect(relativeTime(at(604800), NOW)).toBe('in 1 week');
  });

  it('formats exactly one month (30-day definition)', () => {
    expect(relativeTime(at(2592000), NOW)).toBe('in 1 month');
  });

  it('formats exactly one year', () => {
    expect(relativeTime(at(31536000), NOW)).toBe('in 1 year');
  });

  it('formats a past year', () => {
    expect(relativeTime(at(-31536000), NOW)).toBe('1 year ago');
  });

  it('uses the month unit for 45 days (rounds to 2 months)', () => {
    // 45 days = 3888000s; >= month(2592000), round(3888000/2592000)=round(1.5)=2
    expect(relativeTime(at(45 * 86400), NOW)).toBe('in 2 months');
  });

  it('collapses 400 days into the year unit (rounds to 1 year)', () => {
    // 400 days >= year; round(34560000/31536000) = round(1.096) = 1
    expect(relativeTime(at(400 * 86400), NOW)).toBe('in 1 year');
  });

  it('uses weeks for 29.5 days (just under the month threshold)', () => {
    // 29.5 days = 2548800s < month(2592000) so week unit; round(2548800/604800)=round(4.214)=4
    expect(relativeTime(at(29.5 * 86400), NOW)).toBe('in 4 weeks');
  });
});

describe('relativeTime — determinism', () => {
  it('is deterministic for identical inputs', () => {
    const d = at(7200);
    expect(relativeTime(d, NOW)).toBe(relativeTime(d, NOW));
  });

  it('is sign-symmetric for equal magnitude offsets', () => {
    const future = relativeTime(at(86400), NOW); // "in 1 day"
    const past = relativeTime(at(-86400), NOW); // "1 day ago"
    expect(future).toBe('in 1 day');
    expect(past).toBe('1 day ago');
  });
});

describe('relativeTimeLogic.transform — parsing', () => {
  it('throws on a non-date string', () => {
    expect(() => relativeTimeLogic.transform('x')).toThrow('Could not parse the date.');
  });

  it('throws on an empty string', () => {
    expect(() => relativeTimeLogic.transform('')).toThrow('Could not parse the date.');
  });

  it('throws on a whitespace-only string', () => {
    expect(() => relativeTimeLogic.transform('   ')).toThrow('Could not parse the date.');
  });

  it('throws on an emoji string', () => {
    expect(() => relativeTimeLogic.transform('😀')).toThrow('Could not parse the date.');
  });

  it('throws on an out-of-range date string', () => {
    expect(() => relativeTimeLogic.transform('2024-13-99')).toThrow('Could not parse the date.');
  });

  it('throws on a numeric epoch string (parsed as date text, not a number)', () => {
    // new Date('1700000000000') is Invalid Date — string is not treated as ms epoch
    expect(() => relativeTimeLogic.transform('1700000000000')).toThrow(
      'Could not parse the date.',
    );
  });

  it('parses a far-past ISO date and reports it as "ago"', () => {
    // 1970 is always before any plausible run time, so direction is deterministic.
    const result = relativeTimeLogic.transform('1970-01-01T00:00:00Z');
    expect(result).toMatch(/ ago$/);
    expect(result).toContain('years');
  });

  it('parses a far-future ISO date and reports it as "in"', () => {
    const result = relativeTimeLogic.transform('3000-01-01T00:00:00Z');
    expect(result).toMatch(/^in /);
    expect(result).toContain('years');
  });

  it('trims surrounding whitespace before parsing a valid date', () => {
    const result = relativeTimeLogic.transform('   1970-01-01T00:00:00Z   ');
    expect(result).toMatch(/ ago$/);
  });

  it('returns a string for any successful parse', () => {
    const result = relativeTimeLogic.transform('2099-06-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

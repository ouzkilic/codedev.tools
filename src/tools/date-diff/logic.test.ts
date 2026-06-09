import { describe, it, expect } from 'vitest';
import { dateDiffLogic } from './logic';

const diff = (a: string, b: string) =>
  dateDiffLogic.transform(a, { options: {}, secondary: b });

describe('dateDiff', () => {
  it('computes day difference', () => {
    expect(diff('2024-01-01', '2024-01-08')).toContain('Days:         7');
  });

  it('is order-independent (absolute)', () => {
    expect(diff('2024-01-08', '2024-01-01')).toContain('Days:         7');
  });

  it('computes hours', () => {
    expect(diff('2024-01-01T00:00:00Z', '2024-01-01T06:00:00Z')).toContain('Hours:        6');
  });

  it('throws on an unparseable start date', () => {
    expect(() => diff('nope', '2024-01-01')).toThrow('Could not parse the start date.');
  });

  it('throws on an unparseable end date', () => {
    expect(() => diff('2024-01-01', 'nope')).toThrow('Could not parse the end date.');
  });

  it('emits all six labeled rows in order', () => {
    const out = diff('2024-01-01', '2024-01-08');
    const lines = out.split('\n');
    expect(lines).toHaveLength(6);
    expect(lines[0]).toMatch(/^Milliseconds: /);
    expect(lines[1]).toMatch(/^Seconds: /);
    expect(lines[2]).toMatch(/^Minutes: /);
    expect(lines[3]).toMatch(/^Hours: /);
    expect(lines[4]).toMatch(/^Days: /);
    expect(lines[5]).toMatch(/^Weeks: /);
  });

  it('produces the exact full output for a one-week span', () => {
    expect(diff('2024-01-01', '2024-01-08')).toBe(
      [
        'Milliseconds: 604800000',
        'Seconds:      604800',
        'Minutes:      10080',
        'Hours:        168',
        'Days:         7',
        'Weeks:        1',
      ].join('\n'),
    );
  });

  it('returns all zeros for identical dates', () => {
    expect(diff('2024-01-01', '2024-01-01')).toBe(
      [
        'Milliseconds: 0',
        'Seconds:      0',
        'Minutes:      0',
        'Hours:        0',
        'Days:         0',
        'Weeks:        0',
      ].join('\n'),
    );
  });

  it('is symmetric: swapping start and end gives identical output', () => {
    const forward = diff('2024-01-01', '2024-03-15');
    const backward = diff('2024-03-15', '2024-01-01');
    expect(forward).toBe(backward);
  });

  it('rounds sub-day units to two decimals', () => {
    // 90 seconds -> 1.5 min, 0.03 h (rounded), 0 days
    const out = diff('2024-01-01T00:00:00Z', '2024-01-01T00:01:30Z');
    expect(out).toContain('Milliseconds: 90000');
    expect(out).toContain('Seconds:      90');
    expect(out).toContain('Minutes:      1.5');
    expect(out).toContain('Hours:        0.03');
    expect(out).toContain('Days:         0');
    expect(out).toContain('Weeks:        0');
  });

  it('handles fractional days and weeks (1.5 days)', () => {
    const out = diff('2024-01-01T00:00:00Z', '2024-01-02T12:00:00Z');
    expect(out).toContain('Hours:        36');
    expect(out).toContain('Days:         1.5');
    expect(out).toContain('Weeks:        0.21');
  });

  it('resolves millisecond-level differences', () => {
    const out = diff('2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.250Z');
    expect(out).toContain('Milliseconds: 250');
    expect(out).toContain('Seconds:      0.25');
    expect(out).toContain('Minutes:      0');
  });

  it('accounts for a leap day (Feb 28 -> Mar 1 in 2024 = 2 days)', () => {
    expect(diff('2024-02-28', '2024-03-01')).toContain('Days:         2');
  });

  it('treats a non-leap year correctly (Feb 28 -> Mar 1 in 2023 = 1 day)', () => {
    expect(diff('2023-02-28', '2023-03-01')).toContain('Days:         1');
  });

  it('computes a full leap year span (366 days)', () => {
    const out = diff('2024-01-01', '2025-01-01');
    expect(out).toContain('Days:         366');
    expect(out).toContain('Weeks:        52.29');
    expect(out).toContain('Milliseconds: 31622400000');
  });

  it('trims surrounding whitespace from both inputs', () => {
    const out = diff('  2024-01-01  ', '  2024-01-08  ');
    expect(out).toContain('Days:         7');
    expect(out).toContain('Milliseconds: 604800000');
  });

  it('throws start error for an empty start string', () => {
    expect(() => diff('', '2024-01-01')).toThrow('Could not parse the start date.');
  });

  it('throws start error for a whitespace-only start string', () => {
    expect(() => diff('   ', '2024-01-01')).toThrow('Could not parse the start date.');
  });

  it('throws end error for a whitespace-only end string', () => {
    expect(() => diff('2024-01-01', '   ')).toThrow('Could not parse the end date.');
  });

  it('throws end error when ctx is omitted entirely (secondary defaults to empty)', () => {
    expect(() => dateDiffLogic.transform('2024-01-01')).toThrow(
      'Could not parse the end date.',
    );
  });

  it('throws on emoji / unicode garbage input', () => {
    expect(() => diff('🎉', '2024-01-01')).toThrow('Could not parse the start date.');
    expect(() => diff('2024-01-01', '日付')).toThrow('Could not parse the end date.');
  });

  it('checks the start date before the end date', () => {
    // Both invalid -> start error wins because it is checked first.
    expect(() => diff('garbage', 'also-garbage')).toThrow('Could not parse the start date.');
  });

  it('accepts timestamp-style numeric date strings parseable by Date', () => {
    // ISO date-time with timezone offset.
    const out = diff('2024-06-01T12:00:00+00:00', '2024-06-01T13:00:00+00:00');
    expect(out).toContain('Hours:        1');
    expect(out).toContain('Minutes:      60');
  });

  it('is deterministic across repeated calls (same input -> same output)', () => {
    const a = diff('2020-05-10T08:30:00Z', '2021-09-20T22:15:00Z');
    const b = diff('2020-05-10T08:30:00Z', '2021-09-20T22:15:00Z');
    expect(a).toBe(b);
  });

  it('declares the secondary input metadata', () => {
    expect(dateDiffLogic.secondary).toEqual({
      label: 'End date',
      placeholder: '2024-12-31',
    });
  });
});

import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { computeNextRuns, cronNextLogic } from './logic';

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function ctx(options: Record<string, string | boolean>): ToolContext {
  return { options, secondary: '' };
}

describe('computeNextRuns', () => {
  it('returns the next runs for a 15-minute schedule', () => {
    const result = computeNextRuns('*/15 * * * *', 2, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual(['2024-01-01T00:15:00.000Z', '2024-01-01T00:30:00.000Z']);
  });

  it('returns the next midnight run', () => {
    const result = computeNextRuns('0 0 * * *', 1, new Date('2024-01-01T12:00:00Z'));
    expect(result[0]).toBe('2024-01-02T00:00:00.000Z');
  });

  it('produces exactly the requested count of runs', () => {
    const result = computeNextRuns('* * * * *', 10, new Date('2024-01-01T00:00:00Z'));
    expect(result).toHaveLength(10);
  });

  it('returns an empty array when count is zero', () => {
    const result = computeNextRuns('* * * * *', 0, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual([]);
  });

  it('every-minute schedule advances minute by minute', () => {
    const result = computeNextRuns('* * * * *', 3, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual([
      '2024-01-01T00:01:00.000Z',
      '2024-01-01T00:02:00.000Z',
      '2024-01-01T00:03:00.000Z',
    ]);
  });

  it('does not include the current instant when it matches exactly', () => {
    // from is exactly on a minute boundary; next() should be strictly after.
    const result = computeNextRuns('* * * * *', 1, new Date('2024-01-01T00:00:00Z'));
    expect(result[0]).toBe('2024-01-01T00:01:00.000Z');
  });

  it('hourly schedule (top of every hour)', () => {
    const result = computeNextRuns('0 * * * *', 2, new Date('2024-01-01T10:30:00Z'));
    expect(result).toEqual(['2024-01-01T11:00:00.000Z', '2024-01-01T12:00:00.000Z']);
  });

  it('all outputs are valid ISO-8601 UTC strings', () => {
    const result = computeNextRuns('*/7 * * * *', 5, new Date('2024-03-15T08:13:00Z'));
    for (const r of result) {
      expect(r).toMatch(ISO_RE);
    }
  });

  it('is interpreted in UTC, not local time', () => {
    // 0 0 * * * = midnight UTC. Starting just after midnight UTC -> next is the following day.
    const result = computeNextRuns('0 0 * * *', 1, new Date('2024-06-01T00:00:01Z'));
    expect(result[0]).toBe('2024-06-02T00:00:00.000Z');
  });

  it('supports day-of-week fields (Mondays at 09:00)', () => {
    // 2024-01-01 is a Monday. 0 9 * * 1
    const result = computeNextRuns('0 9 * * 1', 2, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual(['2024-01-01T09:00:00.000Z', '2024-01-08T09:00:00.000Z']);
  });

  it('supports comma lists in the minute field', () => {
    const result = computeNextRuns('0,30 * * * *', 3, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual([
      '2024-01-01T00:30:00.000Z',
      '2024-01-01T01:00:00.000Z',
      '2024-01-01T01:30:00.000Z',
    ]);
  });

  it('supports ranges in the hour field', () => {
    // run at minute 0 of hours 9-11
    const result = computeNextRuns('0 9-11 * * *', 4, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual([
      '2024-01-01T09:00:00.000Z',
      '2024-01-01T10:00:00.000Z',
      '2024-01-01T11:00:00.000Z',
      '2024-01-02T09:00:00.000Z',
    ]);
  });

  it('handles a yearly schedule (Jan 1st midnight) crossing a year boundary', () => {
    const result = computeNextRuns('0 0 1 1 *', 2, new Date('2024-06-01T00:00:00Z'));
    expect(result).toEqual(['2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z']);
  });

  it('handles leap-day-relevant February schedule', () => {
    // last day of Feb at midnight; 2024 is a leap year so Feb 29 exists.
    const result = computeNextRuns('0 0 29 2 *', 1, new Date('2024-01-01T00:00:00Z'));
    expect(result[0]).toBe('2024-02-29T00:00:00.000Z');
  });

  it('is deterministic for identical inputs', () => {
    const a = computeNextRuns('*/10 * * * *', 4, new Date('2024-01-01T00:00:00Z'));
    const b = computeNextRuns('*/10 * * * *', 4, new Date('2024-01-01T00:00:00Z'));
    expect(a).toEqual(b);
  });

  it('throws on a malformed expression', () => {
    expect(() => computeNextRuns('not a cron', 1, new Date('2024-01-01T00:00:00Z'))).toThrow();
  });

  it('throws on an out-of-range minute value', () => {
    expect(() => computeNextRuns('99 * * * *', 1, new Date('2024-01-01T00:00:00Z'))).toThrow();
  });

  it('treats an empty expression as every-minute (all wildcards)', () => {
    // cron-parser interprets '' as the all-wildcard schedule rather than erroring.
    const result = computeNextRuns('', 1, new Date('2024-01-01T00:00:00Z'));
    expect(result[0]).toBe('2024-01-01T00:01:00.000Z');
  });
});

describe('cronNextLogic options', () => {
  it('exposes a single count text option with default 5', () => {
    expect(cronNextLogic.options).toEqual([
      { key: 'count', label: 'Count', type: 'text', placeholder: '5', default: '5' },
    ]);
  });
});

describe('cronNextLogic.transform', () => {
  it('throws on an invalid expression', () => {
    expect(() => cronNextLogic.transform('nonsense')).toThrow('Invalid cron expression.');
  });

  it('treats a whitespace-only expression as every-minute after trimming', () => {
    // input.trim() -> '' which cron-parser parses as the all-wildcard schedule.
    const out = cronNextLogic.transform('   ', ctx({ count: '2' }));
    expect(out.split('\n')).toHaveLength(2);
    for (const line of out.split('\n')) {
      expect(line).toMatch(ISO_RE);
    }
  });

  it('trims surrounding whitespace before parsing', () => {
    const out = cronNextLogic.transform('  * * * * *  ', ctx({ count: '3' }));
    expect(out.split('\n')).toHaveLength(3);
  });

  it('defaults to 5 runs when no options are given', () => {
    const out = cronNextLogic.transform('* * * * *');
    expect(out.split('\n')).toHaveLength(5);
  });

  it('honours an explicit count option', () => {
    const out = cronNextLogic.transform('* * * * *', ctx({ count: '12' }));
    expect(out.split('\n')).toHaveLength(12);
  });

  it('clamps count to a maximum of 50', () => {
    const out = cronNextLogic.transform('* * * * *', ctx({ count: '1000' }));
    expect(out.split('\n')).toHaveLength(50);
  });

  it('clamps a count of zero up to 1', () => {
    const out = cronNextLogic.transform('* * * * *', ctx({ count: '0' }));
    expect(out.split('\n')).toHaveLength(1);
  });

  it('clamps a negative count up to 1', () => {
    const out = cronNextLogic.transform('* * * * *', ctx({ count: '-5' }));
    expect(out.split('\n')).toHaveLength(1);
  });

  it('falls back to 1 when count is non-numeric', () => {
    // parseInt('abc') -> NaN, NaN || 1 -> 1
    const out = cronNextLogic.transform('* * * * *', ctx({ count: 'abc' }));
    expect(out.split('\n')).toHaveLength(1);
  });

  it('uses leading numeric portion of a mixed string (parseInt behaviour)', () => {
    // parseInt('3abc', 10) -> 3
    const out = cronNextLogic.transform('* * * * *', ctx({ count: '3abc' }));
    expect(out.split('\n')).toHaveLength(3);
  });

  it('treats an undefined count option as the default of 5', () => {
    const out = cronNextLogic.transform('* * * * *', ctx({}));
    expect(out.split('\n')).toHaveLength(5);
  });

  it('emits newline-separated ISO timestamps', () => {
    const out = cronNextLogic.transform('* * * * *', ctx({ count: '4' }));
    const lines = out.split('\n');
    expect(lines).toHaveLength(4);
    for (const line of lines) {
      expect(line).toMatch(ISO_RE);
    }
  });

  it('produces strictly increasing timestamps', () => {
    const lines = cronNextLogic.transform('*/5 * * * *', ctx({ count: '6' })).split('\n');
    const times = lines.map((l) => new Date(l).getTime());
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThan(times[i - 1]);
    }
  });
});

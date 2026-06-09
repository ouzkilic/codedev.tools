import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { timestampLogic } from './logic';

const ctx = (mode: string): ToolContext => ({ options: { mode }, secondary: '' });
const toDate = (s: string) => timestampLogic.transform(s, ctx('to-date'));
const toTs = (s: string) => timestampLogic.transform(s, ctx('to-timestamp'));

describe('timestamp', () => {
  describe('option metadata', () => {
    it('exposes a single mode select with two choices and a default', () => {
      expect(timestampLogic.options).toHaveLength(1);
      const opt = timestampLogic.options![0];
      expect(opt.key).toBe('mode');
      expect(opt.type).toBe('select');
      expect(opt.default).toBe('to-date');
      expect(opt.choices?.map((c) => c.value)).toEqual(['to-date', 'to-timestamp']);
    });
  });

  describe('timestamp -> date (to-date)', () => {
    it('converts epoch seconds to an ISO date', () => {
      expect(toDate('0')).toContain('ISO 8601:   1970-01-01T00:00:00.000Z');
    });

    it('emits all five labelled lines', () => {
      const out = toDate('0');
      expect(out).toContain('ISO 8601:');
      expect(out).toContain('UTC:');
      expect(out).toContain('Local:');
      expect(out).toContain('Unix (s):');
      expect(out).toContain('Unix (ms):');
      expect(out.split('\n')).toHaveLength(5);
    });

    it('treats 10-digit values as seconds', () => {
      expect(toDate('1700000000')).toContain('2023-11-14T22:13:20.000Z');
    });

    it('treats 13-digit values (>= 1e12) as milliseconds', () => {
      expect(toDate('1700000000000')).toContain('2023-11-14T22:13:20.000Z');
    });

    it('reports Unix seconds and ms consistently for a seconds input', () => {
      const out = toDate('1700000000');
      expect(out).toContain('Unix (s):   1700000000');
      expect(out).toContain('Unix (ms):  1700000000000');
    });

    it('uses 1e12 as the seconds/ms boundary (just below stays seconds)', () => {
      // 999999999999 (< 1e12) is treated as seconds -> *1000
      const out = toDate('999999999999');
      expect(out).toContain('Unix (ms):  999999999999000');
    });

    it('treats exactly 1e12 as milliseconds', () => {
      // 1000000000000 ms = 2001-09-09T01:46:40.000Z
      const out = toDate('1000000000000');
      expect(out).toContain('ISO 8601:   2001-09-09T01:46:40.000Z');
      expect(out).toContain('Unix (ms):  1000000000000');
    });

    it('trims surrounding whitespace before parsing', () => {
      expect(toDate('  0  ')).toContain('1970-01-01T00:00:00.000Z');
    });

    it('handles negative seconds (pre-epoch dates)', () => {
      // -1 second -> 1969-12-31T23:59:59.000Z (abs < 1e12 so *1000)
      expect(toDate('-1')).toContain('ISO 8601:   1969-12-31T23:59:59.000Z');
    });

    it('uses absolute value for the ms/seconds heuristic on negatives', () => {
      // -1e12 has abs >= 1e12 so treated as ms directly
      const out = toDate('-1000000000000');
      expect(out).toContain('Unix (ms):  -1000000000000');
    });

    it('throws on non-numeric input', () => {
      expect(() => toDate('not a number')).toThrow('Enter a numeric Unix timestamp.');
    });

    it('maps empty input to the epoch (Number("") === 0, finite)', () => {
      expect(toDate('')).toContain('1970-01-01T00:00:00.000Z');
    });

    it('maps whitespace-only input to the epoch (trim then Number === 0)', () => {
      expect(toDate('   ')).toContain('1970-01-01T00:00:00.000Z');
    });

    it('throws when the timestamp is out of representable range', () => {
      // abs >= 1e12 -> used directly as ms; 1e30 ms is beyond the valid Date range
      expect(() => toDate('1e30')).toThrow('Timestamp is out of range.');
    });

    it('throws on emoji / unicode input as non-numeric', () => {
      expect(() => toDate('🕒')).toThrow('Enter a numeric Unix timestamp.');
    });

    it('parses scientific notation that is finite and in range', () => {
      // 1.7e9 seconds -> abs < 1e12 -> *1000
      expect(toDate('1.7e9')).toContain('Unix (ms):  1700000000000');
    });
  });

  describe('date -> timestamp (to-timestamp)', () => {
    it('converts an ISO date back to a timestamp', () => {
      const out = toTs('1970-01-01T00:00:00.000Z');
      expect(out).toContain('Unix (s):   0');
      expect(out).toContain('Unix (ms):  0');
    });

    it('emits exactly three labelled lines', () => {
      const out = toTs('1970-01-01T00:00:00.000Z');
      expect(out.split('\n')).toHaveLength(3);
      expect(out).toContain('ISO 8601:   1970-01-01T00:00:00.000Z');
    });

    it('parses a known ISO instant to its epoch seconds', () => {
      const out = toTs('2023-11-14T22:13:20.000Z');
      expect(out).toContain('Unix (s):   1700000000');
      expect(out).toContain('Unix (ms):  1700000000000');
    });

    it('trims surrounding whitespace before parsing', () => {
      expect(toTs('  1970-01-01T00:00:00.000Z  ')).toContain('Unix (ms):  0');
    });

    it('throws on an unparseable date', () => {
      expect(() => toTs('not a date')).toThrow('Could not parse the date.');
    });

    it('throws on empty input', () => {
      expect(() => toTs('')).toThrow('Could not parse the date.');
    });

    it('throws on emoji input', () => {
      expect(() => toTs('📅')).toThrow('Could not parse the date.');
    });
  });

  describe('mode defaulting and round trips', () => {
    it('defaults to to-date when no context is provided', () => {
      expect(timestampLogic.transform('0')).toContain('1970-01-01T00:00:00.000Z');
    });

    it('defaults to to-date when mode is omitted from options', () => {
      const out = timestampLogic.transform('0', { options: {}, secondary: '' });
      expect(out).toContain('ISO 8601:   1970-01-01T00:00:00.000Z');
    });

    it('round-trips timestamp -> ISO -> timestamp losslessly', () => {
      const iso = toDate('1700000000')
        .split('\n')
        .find((l) => l.startsWith('ISO 8601:'))!
        .replace('ISO 8601:   ', '');
      expect(toTs(iso)).toContain('Unix (s):   1700000000');
    });
  });
});

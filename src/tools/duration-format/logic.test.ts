import { describe, it, expect } from 'vitest';
import { durationFormatLogic } from './logic';

const toHuman = (input: string) =>
  durationFormatLogic.transform(input, { options: { mode: 'to-human' }, secondary: '' });
const toSeconds = (input: string) =>
  durationFormatLogic.transform(input, { options: { mode: 'to-seconds' }, secondary: '' });

describe('durationFormatLogic', () => {
  describe('to-human mode', () => {
    it('converts seconds to human-readable units', () => {
      expect(toHuman('3661')).toBe('1h 1m 1s');
      expect(toHuman('90')).toBe('1m 30s');
      expect(toHuman('172800')).toBe('2d');
    });

    it('returns 0s for zero seconds', () => {
      expect(toHuman('0')).toBe('0s');
    });

    it('omits units that are zero and orders d h m s', () => {
      expect(toHuman('86461')).toBe('1d 1m 1s'); // no hours present
      expect(toHuman('3600')).toBe('1h');
      expect(toHuman('60')).toBe('1m');
      expect(toHuman('1')).toBe('1s');
    });

    it('handles the largest single-unit boundaries', () => {
      expect(toHuman('86399')).toBe('23h 59m 59s'); // one second under a day
      expect(toHuman('86400')).toBe('1d');
    });

    it('combines all four units', () => {
      // 1d + 2h + 3m + 4s = 86400 + 7200 + 180 + 4 = 93784
      expect(toHuman('93784')).toBe('1d 2h 3m 4s');
    });

    it('trims surrounding whitespace before validating', () => {
      expect(toHuman('  120  ')).toBe('2m');
      expect(toHuman('\t90\n')).toBe('1m 30s');
    });

    it('accepts a large but safe integer', () => {
      // Number.MAX_SAFE_INTEGER = 9007199254740991
      const result = toHuman('9007199254740991');
      expect(result).toMatch(/^\d+d( \d+h)?( \d+m)?( \d+s)?$/);
      expect(result).toContain('d');
    });

    it('treats leading zeros as a valid integer', () => {
      expect(toHuman('0090')).toBe('1m 30s');
    });

    it('throws on non-numeric input', () => {
      expect(() => toHuman('abc')).toThrow();
    });

    it('throws on empty and whitespace-only input', () => {
      expect(() => toHuman('')).toThrow();
      expect(() => toHuman('   ')).toThrow();
    });

    it('throws on negative numbers', () => {
      expect(() => toHuman('-5')).toThrow();
    });

    it('throws on decimals and signed values', () => {
      expect(() => toHuman('3.5')).toThrow();
      expect(() => toHuman('+5')).toThrow();
    });

    it('throws on numbers exceeding safe integer range', () => {
      // 10000000000000000 > MAX_SAFE_INTEGER -> not a safe integer
      expect(() => toHuman('10000000000000000')).toThrow('too large');
    });

    it('throws on unicode/emoji and special chars', () => {
      expect(() => toHuman('🚀')).toThrow();
      expect(() => toHuman('12,34')).toThrow();
      expect(() => toHuman('1e3')).toThrow();
    });
  });

  describe('to-seconds mode', () => {
    it('parses human tokens to total seconds', () => {
      expect(toSeconds('1h 30m')).toBe('5400');
      expect(toSeconds('2d')).toBe('172800');
    });

    it('parses each single unit', () => {
      expect(toSeconds('1d')).toBe('86400');
      expect(toSeconds('1h')).toBe('3600');
      expect(toSeconds('1m')).toBe('60');
      expect(toSeconds('1s')).toBe('1');
    });

    it('sums all four units', () => {
      expect(toSeconds('1d 2h 3m 4s')).toBe('93784');
    });

    it('sums repeated and out-of-order tokens (no ordering enforced)', () => {
      expect(toSeconds('30m 1h')).toBe('5400');
      expect(toSeconds('1s 1s 1s')).toBe('3');
    });

    it('handles zero-valued tokens', () => {
      expect(toSeconds('0d')).toBe('0');
      expect(toSeconds('0h 0m 5s')).toBe('5');
    });

    it('collapses multiple whitespace separators', () => {
      expect(toSeconds('1h    30m')).toBe('5400');
      expect(toSeconds('1h\t30m')).toBe('5400');
    });

    it('trims leading/trailing whitespace', () => {
      expect(toSeconds('  2d  ')).toBe('172800');
    });

    it('accepts leading zeros in token values', () => {
      expect(toSeconds('01h 030m')).toBe('5400');
    });

    it('throws on empty and whitespace-only input', () => {
      expect(() => toSeconds('')).toThrow('at least one duration token');
      expect(() => toSeconds('   ')).toThrow('at least one duration token');
    });

    it('throws on unknown unit or malformed token', () => {
      expect(() => toSeconds('5x')).toThrow('Invalid duration token');
      expect(() => toSeconds('1h foo')).toThrow('Invalid duration token: foo');
    });

    it('throws on missing unit, missing number, or wrong format', () => {
      expect(() => toSeconds('5')).toThrow();
      expect(() => toSeconds('h')).toThrow();
      expect(() => toSeconds('1.5h')).toThrow();
      expect(() => toSeconds('-1h')).toThrow();
    });

    it('throws on uppercase unit letters', () => {
      expect(() => toSeconds('1H')).toThrow();
      expect(() => toSeconds('2D')).toThrow();
    });

    it('throws on emoji/unicode tokens', () => {
      expect(() => toSeconds('🚀')).toThrow();
    });
  });

  describe('mode dispatch & options', () => {
    it('defaults to to-human mode when no ctx given', () => {
      expect(durationFormatLogic.transform('45')).toBe('45s');
    });

    it('defaults to to-human mode when mode option absent', () => {
      expect(durationFormatLogic.transform('45', { options: {}, secondary: '' })).toBe('45s');
    });

    it('exposes a mode select option with the two expected choices', () => {
      const opt = durationFormatLogic.options?.find((o) => o.key === 'mode');
      expect(opt).toBeDefined();
      expect(opt?.type).toBe('select');
      expect(opt?.default).toBe('to-human');
      const values = opt?.choices?.map((c) => c.value).sort();
      expect(values).toEqual(['to-human', 'to-seconds']);
    });
  });

  describe('round-trips & determinism', () => {
    it('human -> seconds -> human is idempotent for canonical forms', () => {
      for (const human of ['1d 2h 3m 4s', '1h 30m', '2d', '0s', '23h 59m 59s']) {
        const secs = toSeconds(human);
        expect(toHuman(secs)).toBe(human === '0s' ? '0s' : human);
      }
    });

    it('seconds -> human -> seconds preserves the value', () => {
      for (const secs of ['0', '1', '60', '3661', '93784', '172800']) {
        expect(toSeconds(toHuman(secs))).toBe(secs);
      }
    });

    it('is deterministic across repeated calls', () => {
      expect(toHuman('3661')).toBe(toHuman('3661'));
      expect(toSeconds('1d 2h')).toBe(toSeconds('1d 2h'));
    });
  });
});

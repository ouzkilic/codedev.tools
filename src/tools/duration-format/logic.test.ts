import { describe, it, expect } from 'vitest';
import { durationFormatLogic } from './logic';

const toHuman = (input: string) =>
  durationFormatLogic.transform(input, { options: { mode: 'to-human' }, secondary: '' });
const toSeconds = (input: string) =>
  durationFormatLogic.transform(input, { options: { mode: 'to-seconds' }, secondary: '' });

describe('durationFormatLogic', () => {
  it('converts seconds to human-readable units', () => {
    expect(toHuman('3661')).toBe('1h 1m 1s');
    expect(toHuman('90')).toBe('1m 30s');
    expect(toHuman('172800')).toBe('2d');
  });

  it('returns 0s for zero seconds', () => {
    expect(toHuman('0')).toBe('0s');
  });

  it('parses human tokens to total seconds', () => {
    expect(toSeconds('1h 30m')).toBe('5400');
    expect(toSeconds('2d')).toBe('172800');
  });

  it('defaults to to-human mode', () => {
    expect(durationFormatLogic.transform('45')).toBe('45s');
  });

  it('throws on invalid input', () => {
    expect(() => toHuman('abc')).toThrow();
    expect(() => toSeconds('5x')).toThrow();
  });
});

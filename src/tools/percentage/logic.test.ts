import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { percentageLogic } from './logic';

function ctx(mode: string, secondary: string): ToolContext {
  return { options: { mode }, secondary };
}

describe('percentageLogic', () => {
  // --- mode: of (A% of B) ---
  it('computes A% of B', () => {
    expect(percentageLogic.transform('10', ctx('of', '200'))).toBe('20');
  });

  it('computes A% of B with fractional result rounded to 4 decimals', () => {
    // (33.333 / 100) * 100 = 33.333
    expect(percentageLogic.transform('33.333', ctx('of', '100'))).toBe('33.333');
  });

  it('computes A% of B producing a value needing rounding', () => {
    // (12.5 / 100) * 333 = 41.625
    expect(percentageLogic.transform('12.5', ctx('of', '333'))).toBe('41.625');
  });

  it('handles 0% of B', () => {
    expect(percentageLogic.transform('0', ctx('of', '500'))).toBe('0');
  });

  it('handles A% of 0', () => {
    expect(percentageLogic.transform('25', ctx('of', '0'))).toBe('0');
  });

  it('handles negative A% of B', () => {
    // (-10 / 100) * 200 = -20
    expect(percentageLogic.transform('-10', ctx('of', '200'))).toBe('-20');
  });

  it('handles A% of negative B', () => {
    // (50 / 100) * -40 = -20
    expect(percentageLogic.transform('50', ctx('of', '-40'))).toBe('-20');
  });

  // --- default mode when options.mode missing ---
  it('defaults to "of" mode when mode option is absent', () => {
    expect(
      percentageLogic.transform('10', { options: {}, secondary: '200' } as ToolContext),
    ).toBe('20');
  });

  it('defaults to "of" mode when ctx is undefined and uses empty secondary -> NaN throws', () => {
    // secondary defaults to '' -> parseFloat('') === NaN -> throws Value B not valid
    expect(() => percentageLogic.transform('10')).toThrow('Value B is not a valid number');
  });

  // --- mode: percent-of (A is what % of B) ---
  it('computes A is what percent of B', () => {
    expect(percentageLogic.transform('50', ctx('percent-of', '200'))).toBe('25');
  });

  it('computes percent-of with repeating decimal rounded to 4 places', () => {
    // (1 / 3) * 100 = 33.3333...  -> 33.3333
    expect(percentageLogic.transform('1', ctx('percent-of', '3'))).toBe('33.3333');
  });

  it('computes percent-of rounding up at 4 decimals', () => {
    // (2 / 3) * 100 = 66.6666... -> rounds to 66.6667
    expect(percentageLogic.transform('2', ctx('percent-of', '3'))).toBe('66.6667');
  });

  it('computes percent-of greater than 100', () => {
    // (300 / 200) * 100 = 150
    expect(percentageLogic.transform('300', ctx('percent-of', '200'))).toBe('150');
  });

  it('throws when B is zero in percent-of mode', () => {
    expect(() => percentageLogic.transform('50', ctx('percent-of', '0'))).toThrow(
      'Value B cannot be zero',
    );
  });

  // --- mode: change (% change from A to B) ---
  it('computes positive percent change', () => {
    expect(percentageLogic.transform('100', ctx('change', '150'))).toBe('50');
  });

  it('computes negative percent change', () => {
    expect(percentageLogic.transform('200', ctx('change', '100'))).toBe('-50');
  });

  it('computes zero percent change when A equals B', () => {
    expect(percentageLogic.transform('80', ctx('change', '80'))).toBe('0');
  });

  it('computes percent change with negative base A', () => {
    // ((b - a) / a) * 100 = ((50 - (-100)) / -100) * 100 = (150 / -100) * 100 = -150
    expect(percentageLogic.transform('-100', ctx('change', '50'))).toBe('-150');
  });

  it('throws on division by zero for change mode', () => {
    expect(() => percentageLogic.transform('0', ctx('change', '100'))).toThrow(
      'Value A cannot be zero',
    );
  });

  // --- error paths: invalid numbers ---
  it('throws on non-numeric Value A', () => {
    expect(() => percentageLogic.transform('abc', ctx('of', '200'))).toThrow(
      'Value A is not a valid number',
    );
  });

  it('throws on non-numeric Value B', () => {
    expect(() => percentageLogic.transform('10', ctx('of', 'xyz'))).toThrow(
      'Value B is not a valid number',
    );
  });

  it('throws on empty Value A', () => {
    expect(() => percentageLogic.transform('', ctx('of', '200'))).toThrow(
      'Value A is not a valid number',
    );
  });

  it('throws on whitespace-only Value A', () => {
    expect(() => percentageLogic.transform('   ', ctx('of', '200'))).toThrow(
      'Value A is not a valid number',
    );
  });

  it('throws on whitespace-only Value B', () => {
    expect(() => percentageLogic.transform('10', ctx('of', '   '))).toThrow(
      'Value B is not a valid number',
    );
  });

  it('checks Value A before Value B', () => {
    // both invalid -> A error reported first
    expect(() => percentageLogic.transform('foo', ctx('of', 'bar'))).toThrow(
      'Value A is not a valid number',
    );
  });

  // --- input parsing / trimming behavior ---
  it('trims surrounding whitespace on inputs', () => {
    expect(percentageLogic.transform('  10  ', ctx('of', '  200  '))).toBe('20');
  });

  it('parses leading numeric portion via parseFloat (trailing junk ignored)', () => {
    // parseFloat('10abc') === 10
    expect(percentageLogic.transform('10abc', ctx('of', '200xyz'))).toBe('20');
  });

  it('handles scientific notation input', () => {
    // parseFloat('1e2') === 100 ; (100/100)*5 = 5
    expect(percentageLogic.transform('1e2', ctx('of', '5'))).toBe('5');
  });

  it('handles very large numbers', () => {
    // (50 / 100) * 1e12 = 5e11
    expect(percentageLogic.transform('50', ctx('of', '1000000000000'))).toBe('500000000000');
  });

  // --- unknown mode ---
  it('throws on unknown mode', () => {
    expect(() => percentageLogic.transform('10', ctx('bogus', '200'))).toThrow('Unknown mode: bogus');
  });

  // --- determinism ---
  it('is deterministic for identical inputs', () => {
    const a = percentageLogic.transform('7', ctx('percent-of', '13'));
    const b = percentageLogic.transform('7', ctx('percent-of', '13'));
    expect(a).toBe(b);
  });

  // --- metadata sanity ---
  it('exposes a mode select option with three choices', () => {
    const modeOpt = percentageLogic.options?.find((o) => o.key === 'mode');
    expect(modeOpt?.type).toBe('select');
    expect(modeOpt?.choices?.map((c) => c.value)).toEqual(['of', 'percent-of', 'change']);
    expect(modeOpt?.default).toBe('of');
  });

  it('declares a secondary input for Value B', () => {
    expect(percentageLogic.secondary?.label).toBe('Value B');
  });
});

import { describe, it, expect } from 'vitest';
import { romanLogic } from './logic';

const toRoman = (s: string) => romanLogic.transform(s, { options: { mode: 'to-roman' }, secondary: '' });
const toNum = (s: string) => romanLogic.transform(s, { options: { mode: 'to-number' }, secondary: '' });

describe('roman: number -> roman', () => {
  it('converts representative numbers correctly', () => {
    expect(toRoman('2024')).toBe('MMXXIV');
    expect(toRoman('4')).toBe('IV');
    expect(toRoman('3999')).toBe('MMMCMXCIX');
  });

  it('handles the lower boundary value 1', () => {
    expect(toRoman('1')).toBe('I');
  });

  it('handles the upper boundary value 3999', () => {
    expect(toRoman('3999')).toBe('MMMCMXCIX');
  });

  it('converts the subtractive notation values', () => {
    expect(toRoman('9')).toBe('IX');
    expect(toRoman('40')).toBe('XL');
    expect(toRoman('90')).toBe('XC');
    expect(toRoman('400')).toBe('CD');
    expect(toRoman('900')).toBe('CM');
  });

  it('converts the simple symbol values', () => {
    expect(toRoman('5')).toBe('V');
    expect(toRoman('10')).toBe('X');
    expect(toRoman('50')).toBe('L');
    expect(toRoman('100')).toBe('C');
    expect(toRoman('500')).toBe('D');
    expect(toRoman('1000')).toBe('M');
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(toRoman('   42   ')).toBe('XLII');
  });

  it('accepts integer-valued floats (3.0 -> III)', () => {
    expect(toRoman('3.0')).toBe('III');
  });

  it('accepts exponent notation that yields an integer (1e3 -> M)', () => {
    expect(toRoman('1e3')).toBe('M');
  });

  it('accepts hex string parsed by Number (0x10 -> 16 -> XVI)', () => {
    expect(toRoman('0x10')).toBe('XVI');
  });

  it('defaults to to-roman mode when no options provided', () => {
    expect(romanLogic.transform('7', { options: {}, secondary: '' })).toBe('VII');
  });

  it('throws on the out-of-range value 4000', () => {
    expect(() => toRoman('4000')).toThrow();
  });

  it('throws on zero', () => {
    expect(() => toRoman('0')).toThrow();
  });

  it('throws on negative numbers', () => {
    expect(() => toRoman('-1')).toThrow();
  });

  it('throws on non-integer floats', () => {
    expect(() => toRoman('12.5')).toThrow();
  });

  it('throws on empty input (Number("") === 0)', () => {
    expect(() => toRoman('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => toRoman('   ')).toThrow();
  });

  it('throws on non-numeric input (NaN)', () => {
    expect(() => toRoman('abc')).toThrow();
  });

  it('throws with a descriptive range message', () => {
    expect(() => toRoman('5000')).toThrow('Enter an integer between 1 and 3999.');
  });
});

describe('roman: roman -> number', () => {
  it('converts representative numerals correctly', () => {
    expect(toNum('MMXXIV')).toBe('2024');
    expect(toNum('IX')).toBe('9');
    expect(toNum('MMMCMXCIX')).toBe('3999');
  });

  it('is case-insensitive (lowercase accepted)', () => {
    expect(toNum('ix')).toBe('9');
    expect(toNum('mmxxiv')).toBe('2024');
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(toNum('  XLII  ')).toBe('42');
  });

  it('converts the boundary value I (lowest)', () => {
    expect(toNum('I')).toBe('1');
  });

  it('throws on the repeated-four invalid form IIII', () => {
    expect(() => toNum('IIII')).toThrow();
  });

  it('throws on letters outside the roman alphabet', () => {
    expect(() => toNum('ABC')).toThrow();
  });

  it('throws on empty input (fails the regex)', () => {
    expect(() => toNum('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => toNum('   ')).toThrow();
  });

  it('throws on malformed but in-alphabet sequence (IC)', () => {
    expect(() => toNum('IC')).toThrow();
  });

  it('throws on non-canonical ordering (VX)', () => {
    expect(() => toNum('VX')).toThrow();
  });

  it('throws with the invalid-numeral message', () => {
    expect(() => toNum('IIII')).toThrow('Invalid Roman numeral.');
  });
});

describe('roman: round-trips and properties', () => {
  it('round-trips a sampling of numbers (number -> roman -> number)', () => {
    for (const n of [1, 4, 9, 14, 40, 90, 444, 900, 1987, 2421, 3888, 3999]) {
      const roman = toRoman(String(n));
      expect(toNum(roman)).toBe(String(n));
    }
  });

  it('round-trips canonical numerals (roman -> number -> roman)', () => {
    for (const r of ['IV', 'XL', 'XC', 'CD', 'CM', 'MMXXIV', 'MMMCMXCIX']) {
      const num = toNum(r);
      expect(toRoman(num)).toBe(r);
    }
  });

  it('is deterministic for repeated calls', () => {
    expect(toRoman('1666')).toBe(toRoman('1666'));
    expect(toNum('MDCLXVI')).toBe(toNum('MDCLXVI'));
  });

  it('produces only valid roman characters for all valid inputs', () => {
    for (const n of [1, 58, 1994, 3999]) {
      expect(toRoman(String(n))).toMatch(/^[MDCLXVI]+$/);
    }
  });
});

describe('roman: option metadata', () => {
  it('exposes a mode select with two choices and a default', () => {
    const mode = romanLogic.options?.find((o) => o.key === 'mode');
    expect(mode).toBeDefined();
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('to-roman');
    expect(mode?.choices?.map((c) => c.value)).toEqual(['to-roman', 'to-number']);
  });
});

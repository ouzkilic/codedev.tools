import { describe, it, expect } from 'vitest';
import { romanLogic } from './logic';

const toRoman = (s: string) => romanLogic.transform(s, { options: { mode: 'to-roman' }, secondary: '' });
const toNum = (s: string) => romanLogic.transform(s, { options: { mode: 'to-number' }, secondary: '' });

describe('roman', () => {
  it('converts numbers to Roman numerals', () => {
    expect(toRoman('2024')).toBe('MMXXIV');
    expect(toRoman('4')).toBe('IV');
    expect(toRoman('3999')).toBe('MMMCMXCIX');
  });
  it('converts Roman numerals to numbers', () => {
    expect(toNum('MMXXIV')).toBe('2024');
    expect(toNum('ix')).toBe('9');
  });
  it('throws on out-of-range numbers', () => {
    expect(() => toRoman('4000')).toThrow();
    expect(() => toRoman('0')).toThrow();
  });
  it('throws on invalid Roman numerals', () => {
    expect(() => toNum('IIII')).toThrow();
    expect(() => toNum('ABC')).toThrow();
  });
});

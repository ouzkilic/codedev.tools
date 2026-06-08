import { describe, it, expect } from 'vitest';
import { numberToWordsLogic } from './logic';

describe('numberToWordsLogic', () => {
  it('converts zero', () => {
    expect(numberToWordsLogic.transform('0')).toBe('zero');
  });
  it('hyphenates tens', () => {
    expect(numberToWordsLogic.transform('42')).toBe('forty-two');
  });
  it('handles hundreds', () => {
    expect(numberToWordsLogic.transform('100')).toBe('one hundred');
  });
  it('handles thousands', () => {
    expect(numberToWordsLogic.transform('1000')).toBe('one thousand');
  });
  it('handles compound numbers', () => {
    expect(numberToWordsLogic.transform('1234')).toBe('one thousand two hundred thirty-four');
  });
  it('handles negatives', () => {
    expect(numberToWordsLogic.transform('-5')).toBe('negative five');
  });
  it('throws on non-numeric input', () => {
    expect(() => numberToWordsLogic.transform('abc')).toThrow();
  });
  it('throws on non-integer input', () => {
    expect(() => numberToWordsLogic.transform('1.5')).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { numberFormatLogic } from './logic';

describe('numberFormatLogic', () => {
  it('groups with comma separator', () => {
    expect(numberFormatLogic.transform('1234567', { options: { separator: ',' }, secondary: '' })).toBe('1,234,567');
  });

  it('groups thousands', () => {
    expect(numberFormatLogic.transform('1000', { options: { separator: ',' }, secondary: '' })).toBe('1,000');
  });

  it('preserves fraction part', () => {
    expect(numberFormatLogic.transform('1234567.89', { options: { separator: ',' }, secondary: '' })).toBe('1,234,567.89');
  });

  it('groups with space separator', () => {
    expect(numberFormatLogic.transform('1234567', { options: { separator: ' ' }, secondary: '' })).toBe('1 234 567');
  });

  it('preserves negative sign', () => {
    expect(numberFormatLogic.transform('-1000', { options: { separator: ',' }, secondary: '' })).toBe('-1,000');
  });

  it('throws on non-numeric input', () => {
    expect(() => numberFormatLogic.transform('abc', { options: { separator: ',' }, secondary: '' })).toThrow();
  });
});

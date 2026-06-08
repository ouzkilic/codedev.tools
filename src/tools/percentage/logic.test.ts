import { describe, it, expect } from 'vitest';
import { percentageLogic } from './logic';

describe('percentageLogic', () => {
  it('computes A% of B', () => {
    expect(percentageLogic.transform('10', { options: { mode: 'of' }, secondary: '200' })).toBe('20');
  });

  it('computes A is what percent of B', () => {
    expect(percentageLogic.transform('50', { options: { mode: 'percent-of' }, secondary: '200' })).toBe('25');
  });

  it('computes positive percent change', () => {
    expect(percentageLogic.transform('100', { options: { mode: 'change' }, secondary: '150' })).toBe('50');
  });

  it('computes negative percent change', () => {
    expect(percentageLogic.transform('200', { options: { mode: 'change' }, secondary: '100' })).toBe('-50');
  });

  it('throws on non-numeric input', () => {
    expect(() => percentageLogic.transform('abc', { options: { mode: 'of' }, secondary: '200' })).toThrow();
  });

  it('throws on division by zero for change mode', () => {
    expect(() => percentageLogic.transform('0', { options: { mode: 'change' }, secondary: '100' })).toThrow();
  });
});

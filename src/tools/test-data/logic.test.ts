import { describe, it, expect } from 'vitest';
import { buildTestData, isLuhnValid } from './logic';

describe('test-data', () => {
  it('validates Luhn correctly', () => {
    expect(isLuhnValid('4242424242424242')).toBe(true);
    expect(isLuhnValid('4242424242424241')).toBe(false);
  });

  it('generates 16-digit Luhn-valid credit-card numbers', () => {
    const lines = buildTestData({ type: 'credit-card', count: '5' }).split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(/^4\d{15}$/);
      expect(line).toHaveLength(16);
      expect(isLuhnValid(line)).toBe(true);
    }
  });

  it('respects the count option', () => {
    expect(buildTestData({ type: 'credit-card', count: '12' }).split('\n')).toHaveLength(12);
    expect(buildTestData({ type: 'iban', count: '7' }).split('\n')).toHaveLength(7);
  });

  it('clamps count to 1..100', () => {
    expect(buildTestData({ type: 'credit-card', count: '0' }).split('\n')).toHaveLength(1);
    expect(buildTestData({ type: 'credit-card', count: 'x' }).split('\n')).toHaveLength(1);
    expect(buildTestData({ type: 'credit-card', count: '500' }).split('\n')).toHaveLength(100);
  });

  it('generates plausible test IBANs', () => {
    const lines = buildTestData({ type: 'iban', count: '5' }).split('\n');
    for (const line of lines) {
      expect(line).toMatch(/^DE\d{20}$/);
    }
  });
});

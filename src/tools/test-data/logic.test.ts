import { describe, it, expect } from 'vitest';
import { buildTestData, isLuhnValid, TESTDATA_OPTIONS } from './logic';

describe('test-data: isLuhnValid', () => {
  it('validates Luhn correctly', () => {
    expect(isLuhnValid('4242424242424242')).toBe(true);
    expect(isLuhnValid('4242424242424241')).toBe(false);
  });

  it('accepts well-known valid sample numbers', () => {
    expect(isLuhnValid('79927398713')).toBe(true);
    expect(isLuhnValid('5555555555554444')).toBe(true);
    expect(isLuhnValid('4111111111111111')).toBe(true);
  });

  it('rejects an empty string (length guard)', () => {
    expect(isLuhnValid('')).toBe(false);
  });

  it('validates a single-digit zero as Luhn-valid', () => {
    expect(isLuhnValid('0')).toBe(true);
  });

  it('rejects a single non-zero digit', () => {
    expect(isLuhnValid('5')).toBe(false);
  });
});

describe('test-data: buildTestData credit cards', () => {
  it('generates 16-digit Luhn-valid credit-card numbers', () => {
    const lines = buildTestData({ type: 'credit-card', count: '5' }).split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(/^4\d{15}$/);
      expect(line).toHaveLength(16);
      expect(isLuhnValid(line)).toBe(true);
    }
  });

  it('always starts credit cards with a 4 (Visa prefix)', () => {
    const lines = buildTestData({ type: 'credit-card', count: '20' }).split('\n');
    for (const line of lines) {
      expect(line[0]).toBe('4');
    }
  });

  it('defaults to credit-card for an unknown type', () => {
    const line = buildTestData({ type: 'totally-unknown', count: '1' });
    expect(line).toMatch(/^4\d{15}$/);
    expect(isLuhnValid(line)).toBe(true);
  });

  it('defaults to credit-card when type is omitted', () => {
    const line = buildTestData({ count: '1' });
    expect(line).toMatch(/^4\d{15}$/);
    expect(isLuhnValid(line)).toBe(true);
  });
});

describe('test-data: buildTestData IBANs', () => {
  it('generates plausible test IBANs', () => {
    const lines = buildTestData({ type: 'iban', count: '5' }).split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(/^DE\d{20}$/);
      expect(line).toHaveLength(22);
    }
  });
});

describe('test-data: count option', () => {
  it('respects the count option for both types', () => {
    expect(buildTestData({ type: 'credit-card', count: '12' }).split('\n')).toHaveLength(12);
    expect(buildTestData({ type: 'iban', count: '7' }).split('\n')).toHaveLength(7);
  });

  it('clamps count to 1..100', () => {
    expect(buildTestData({ type: 'credit-card', count: '0' }).split('\n')).toHaveLength(1);
    expect(buildTestData({ type: 'credit-card', count: 'x' }).split('\n')).toHaveLength(1);
    expect(buildTestData({ type: 'credit-card', count: '500' }).split('\n')).toHaveLength(100);
  });

  it('clamps the upper boundary exactly at 100', () => {
    expect(buildTestData({ type: 'credit-card', count: '100' }).split('\n')).toHaveLength(100);
    expect(buildTestData({ type: 'credit-card', count: '101' }).split('\n')).toHaveLength(100);
  });

  it('clamps negative counts up to 1', () => {
    expect(buildTestData({ type: 'iban', count: '-3' }).split('\n')).toHaveLength(1);
  });

  it('defaults to 1 line when count is omitted', () => {
    expect(buildTestData({ type: 'credit-card' }).split('\n')).toHaveLength(1);
  });

  it('parses leading-integer strings via parseInt', () => {
    // parseInt('5.9') === 5, parseInt('3abc') === 3
    expect(buildTestData({ type: 'credit-card', count: '5.9' }).split('\n')).toHaveLength(5);
    expect(buildTestData({ type: 'iban', count: '3abc' }).split('\n')).toHaveLength(3);
  });

  it('joins multiple results with newlines and no trailing newline', () => {
    const out = buildTestData({ type: 'iban', count: '3' });
    expect(out.endsWith('\n')).toBe(false);
    expect((out.match(/\n/g) ?? []).length).toBe(2);
  });
});

describe('test-data: TESTDATA_OPTIONS metadata', () => {
  it('exposes a type select with credit-card and iban choices', () => {
    const typeOpt = TESTDATA_OPTIONS.find((o) => o.key === 'type');
    expect(typeOpt?.type).toBe('select');
    expect(typeOpt?.default).toBe('credit-card');
    const values = typeOpt?.choices?.map((c) => c.value);
    expect(values).toEqual(['credit-card', 'iban']);
  });

  it('exposes a count option defaulting to 5', () => {
    const countOpt = TESTDATA_OPTIONS.find((o) => o.key === 'count');
    expect(countOpt?.type).toBe('text');
    expect(countOpt?.default).toBe('5');
  });
});

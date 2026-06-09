import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { numberFormatLogic } from './logic';

const ctx = (separator: string): ToolContext => ({
  options: { separator },
  secondary: '',
});

describe('numberFormatLogic', () => {
  // --- existing assertions preserved ---
  it('groups with comma separator', () => {
    expect(numberFormatLogic.transform('1234567', ctx(','))).toBe('1,234,567');
  });

  it('groups thousands', () => {
    expect(numberFormatLogic.transform('1000', ctx(','))).toBe('1,000');
  });

  it('preserves fraction part', () => {
    expect(numberFormatLogic.transform('1234567.89', ctx(','))).toBe('1,234,567.89');
  });

  it('groups with space separator', () => {
    expect(numberFormatLogic.transform('1234567', ctx(' '))).toBe('1 234 567');
  });

  it('preserves negative sign', () => {
    expect(numberFormatLogic.transform('-1000', ctx(','))).toBe('-1,000');
  });

  it('throws on non-numeric input', () => {
    expect(() => numberFormatLogic.transform('abc', ctx(','))).toThrow();
  });

  // --- empty / whitespace handling ---
  it('returns empty string for empty input', () => {
    expect(numberFormatLogic.transform('', ctx(','))).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(numberFormatLogic.transform('   \t\n  ', ctx(','))).toBe('');
  });

  it('trims surrounding whitespace before formatting', () => {
    expect(numberFormatLogic.transform('  1234567  ', ctx(','))).toBe('1,234,567');
  });

  // --- separator branches (every select choice) ---
  it('groups with dot separator', () => {
    expect(numberFormatLogic.transform('1234567', ctx('.'))).toBe('1.234.567');
  });

  it('groups with none (empty) separator leaving digits unchanged', () => {
    expect(numberFormatLogic.transform('1234567', ctx(''))).toBe('1234567');
  });

  it('defaults to comma when separator option is missing', () => {
    // ctx with no separator key -> ?? ',' fallback
    expect(numberFormatLogic.transform('1234567', { options: {}, secondary: '' })).toBe('1,234,567');
  });

  it('defaults to comma when ctx is omitted entirely', () => {
    expect(numberFormatLogic.transform('1234567')).toBe('1,234,567');
  });

  it('coerces non-string separator via String()', () => {
    // numeric separator option should be stringified, not crash
    expect(numberFormatLogic.transform('1234', { options: { separator: 0 as unknown as string }, secondary: '' })).toBe('10234');
  });

  // --- boundary group sizes ---
  it('does not insert separator for fewer than 4 digits', () => {
    expect(numberFormatLogic.transform('999', ctx(','))).toBe('999');
    expect(numberFormatLogic.transform('1', ctx(','))).toBe('1');
  });

  it('inserts a single separator at exactly 4 digits', () => {
    expect(numberFormatLogic.transform('1234', ctx(','))).toBe('1,234');
  });

  it('groups a number whose integer length is a multiple of 3', () => {
    expect(numberFormatLogic.transform('123456', ctx(','))).toBe('123,456');
  });

  // --- zero and negatives ---
  it('formats zero unchanged', () => {
    expect(numberFormatLogic.transform('0', ctx(','))).toBe('0');
  });

  it('formats negative number with fraction', () => {
    expect(numberFormatLogic.transform('-1234567.89', ctx(','))).toBe('-1,234,567.89');
  });

  it('formats negative number with space separator', () => {
    expect(numberFormatLogic.transform('-1234567', ctx(' '))).toBe('-1 234 567');
  });

  // --- fraction part is never grouped ---
  it('leaves long fraction part ungrouped', () => {
    expect(numberFormatLogic.transform('1.123456789', ctx(','))).toBe('1.123456789');
  });

  // --- very large input determinism ---
  it('handles very large integers deterministically', () => {
    const big = '1' + '0'.repeat(30); // 31 digits
    const out = numberFormatLogic.transform(big, ctx(','));
    expect(out).toBe('1,000,000,000,000,000,000,000,000,000,000');
    expect((out.match(/,/g) ?? []).length).toBe(10);
  });

  // --- error paths ---
  it('throws on input with embedded letters', () => {
    expect(() => numberFormatLogic.transform('12a34', ctx(','))).toThrow('Input is not a valid number');
  });

  it('throws on a lone minus sign', () => {
    expect(() => numberFormatLogic.transform('-', ctx(','))).toThrow();
  });

  it('throws on trailing decimal point', () => {
    expect(() => numberFormatLogic.transform('123.', ctx(','))).toThrow();
  });

  it('throws on leading decimal point', () => {
    expect(() => numberFormatLogic.transform('.5', ctx(','))).toThrow();
  });

  it('throws on input that already contains separators', () => {
    expect(() => numberFormatLogic.transform('1,234', ctx(','))).toThrow();
  });

  it('throws on scientific notation', () => {
    expect(() => numberFormatLogic.transform('1e5', ctx(','))).toThrow();
  });

  it('throws on multiple decimal points', () => {
    expect(() => numberFormatLogic.transform('1.2.3', ctx(','))).toThrow();
  });

  it('throws on a leading plus sign', () => {
    expect(() => numberFormatLogic.transform('+1000', ctx(','))).toThrow();
  });

  it('throws on unicode / emoji input', () => {
    expect(() => numberFormatLogic.transform('１２３', ctx(','))).toThrow(); // fullwidth digits
    expect(() => numberFormatLogic.transform('💯', ctx(','))).toThrow();
  });

  // --- idempotency-style property: ungrouped output round-trips through "none" ---
  it('grouping with none separator is identity on validated digits', () => {
    const n = '-1234567.89';
    expect(numberFormatLogic.transform(n, ctx(''))).toBe(n);
  });

  // --- determinism: repeated calls give identical results ---
  it('is deterministic across repeated calls', () => {
    const a = numberFormatLogic.transform('9876543210', ctx(','));
    const b = numberFormatLogic.transform('9876543210', ctx(','));
    expect(a).toBe(b);
    expect(a).toBe('9,876,543,210');
  });

  // --- options metadata sanity ---
  it('exposes the separator select option with four choices', () => {
    const opt = numberFormatLogic.options?.find((o) => o.key === 'separator');
    expect(opt?.type).toBe('select');
    expect(opt?.default).toBe(',');
    expect(opt?.choices?.map((c) => c.value)).toEqual([',', ' ', '.', '']);
  });
});

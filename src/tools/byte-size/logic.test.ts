import { describe, it, expect } from 'vitest';
import { byteSizeLogic } from './logic';

describe('byteSize', () => {
  // ---- happy path / existing assertions ----
  it('humanizes a raw byte count', () => {
    const out = byteSizeLogic.transform('1024');
    expect(out).toContain('Bytes:    1024');
    expect(out).toContain('Binary:   1 KiB');
    expect(out).toContain('Decimal:  1.02 KB');
  });

  it('parses a size with a unit back to bytes', () => {
    expect(byteSizeLogic.transform('1 MB')).toContain('Bytes:    1000000');
  });

  it('parses binary units', () => {
    expect(byteSizeLogic.transform('1 MiB')).toContain('Bytes:    1048576');
  });

  it('throws on invalid input', () => {
    expect(() => byteSizeLogic.transform('abc')).toThrow();
  });

  // ---- output structure / determinism ----
  it('produces exactly three labeled lines in order', () => {
    const lines = byteSizeLogic.transform('1024').split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^Bytes:/);
    expect(lines[1]).toMatch(/^Decimal:/);
    expect(lines[2]).toMatch(/^Binary:/);
  });

  it('is deterministic for the same input', () => {
    expect(byteSizeLogic.transform('1.5 MB')).toBe(byteSizeLogic.transform('1.5 MB'));
  });

  // ---- raw byte counts (no unit defaults to bytes) ----
  it('renders zero bytes as 0 B in both bases', () => {
    const out = byteSizeLogic.transform('0');
    expect(out).toBe('Bytes:    0\nDecimal:  0 B\nBinary:   0 B');
  });

  it('keeps small values under the base in B', () => {
    const out = byteSizeLogic.transform('512');
    expect(out).toContain('Decimal:  512 B');
    expect(out).toContain('Binary:   512 B');
  });

  it('treats 999 as below the decimal base (still B)', () => {
    const out = byteSizeLogic.transform('999');
    expect(out).toContain('Decimal:  999 B');
    expect(out).toContain('Binary:   999 B');
  });

  it('crosses the decimal base at exactly 1000', () => {
    const out = byteSizeLogic.transform('1000');
    // 1000 >= 1000 -> 1 KB decimal, but 1000 < 1024 -> stays 1000 B binary
    expect(out).toContain('Decimal:  1 KB');
    expect(out).toContain('Binary:   1000 B');
  });

  // ---- decimal unit parsing ----
  it('parses KB to 1000 bytes', () => {
    expect(byteSizeLogic.transform('1 KB')).toContain('Bytes:    1000');
  });

  it('parses GB to 1e9 bytes', () => {
    expect(byteSizeLogic.transform('1 GB')).toContain('Bytes:    1000000000');
  });

  it('parses TB to 1e12 bytes (lowercase, no space)', () => {
    expect(byteSizeLogic.transform('1tb')).toContain('Bytes:    1000000000000');
  });

  // ---- binary unit parsing ----
  it('parses TiB to 1024^4 bytes', () => {
    expect(byteSizeLogic.transform('1 TiB')).toContain('Bytes:    1099511627776');
  });

  it('parses a fractional binary unit without a space', () => {
    const out = byteSizeLogic.transform('2.5gib');
    expect(out).toContain('Bytes:    2684354560');
    expect(out).toContain('Binary:   2.5 GiB');
  });

  // ---- formatting / rounding ----
  it('rounds binary representation of 1 MB to 2 decimals', () => {
    const out = byteSizeLogic.transform('1 MB');
    expect(out).toContain('Decimal:  1 MB');
    expect(out).toContain('Binary:   976.56 KiB');
  });

  it('preserves a single trailing decimal without padding', () => {
    const out = byteSizeLogic.transform('1.5 MB');
    expect(out).toContain('Decimal:  1.5 MB'); // 1.50 -> parseFloat -> 1.5
    expect(out).toContain('Binary:   1.43 MiB');
  });

  it('uses the petabyte tier for very large values', () => {
    const out = byteSizeLogic.transform('1234567890123456');
    expect(out).toContain('Bytes:    1234567890123456');
    expect(out).toContain('Decimal:  1.23 PB');
    expect(out).toContain('Binary:   1.1 PiB');
  });

  // ---- whitespace / formatting tolerance ----
  it('trims surrounding whitespace and is case-insensitive', () => {
    const out = byteSizeLogic.transform('   2 KB   ');
    expect(out).toContain('Bytes:    2000');
    expect(out).toContain('Binary:   1.95 KiB');
  });

  it('accepts a trailing dot as a valid number (1.)', () => {
    expect(byteSizeLogic.transform('1.')).toContain('Bytes:    1');
  });

  it('accepts a leading-dot fraction (0.5 kb -> 500 bytes)', () => {
    expect(byteSizeLogic.transform('0.5 kb')).toContain('Bytes:    500');
  });

  // ---- round-trip: parsed bytes echoed back equal a raw count ----
  it('round-trips: a unit value and its raw byte count agree', () => {
    const fromUnit = byteSizeLogic.transform('1 MiB');
    const fromRaw = byteSizeLogic.transform('1048576');
    expect(fromUnit).toBe(fromRaw);
  });

  // ---- error paths ----
  it('throws on empty string', () => {
    expect(() => byteSizeLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => byteSizeLogic.transform('   ')).toThrow();
  });

  it('throws on an unsupported unit (PB is not in the map)', () => {
    expect(() => byteSizeLogic.transform('1 PB')).toThrow();
  });

  it('throws on negative numbers (minus sign not matched)', () => {
    expect(() => byteSizeLogic.transform('-5')).toThrow();
  });

  it('throws on scientific notation (e not allowed)', () => {
    expect(() => byteSizeLogic.transform('1e3')).toThrow();
  });

  it('throws on a bare dot with no digits', () => {
    expect(() => byteSizeLogic.transform('.')).toThrow();
  });

  it('throws on extra tokens after the number', () => {
    expect(() => byteSizeLogic.transform('1 2 kb')).toThrow();
  });

  it('throws on a unit with no number', () => {
    expect(() => byteSizeLogic.transform('kb')).toThrow();
  });

  it('throws on trailing junk characters', () => {
    expect(() => byteSizeLogic.transform('5%')).toThrow();
  });

  it('throws with a helpful message mentioning a size example', () => {
    expect(() => byteSizeLogic.transform('not-a-size')).toThrow(/1\.5 MB/);
  });
});

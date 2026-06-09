import { describe, it, expect } from 'vitest';
import { baseConvertLogic } from './logic';

const conv = (s: string, from = 'auto') =>
  baseConvertLogic.transform(s, { options: { from }, secondary: '' });

/** Extract a single labelled line's value from the multi-line output. */
const line = (out: string, label: string) => {
  const m = out.split('\n').find((l) => l.startsWith(label));
  return m ? m.slice(label.length).trim() : undefined;
};

describe('baseConvert', () => {
  // --- happy paths / existing assertions kept ---
  it('converts decimal to all bases', () => {
    const out = conv('255');
    expect(out).toContain('Decimal:  255');
    expect(out).toContain('Hex:      ff');
    expect(out).toContain('Binary:   11111111');
    expect(out).toContain('Octal:    377');
  });

  it('auto-detects a 0x hex prefix', () => {
    expect(conv('0xff')).toContain('Decimal:  255');
  });

  it('auto-detects a 0b binary prefix', () => {
    expect(conv('0b1010')).toContain('Decimal:  10');
  });

  it('auto-detects a 0o octal prefix', () => {
    const out = conv('0o17');
    expect(line(out, 'Decimal:')).toBe('15');
    expect(line(out, 'Hex:')).toBe('f');
  });

  it('reads an explicit source base (hex)', () => {
    expect(conv('ff', '16')).toContain('Decimal:  255');
  });

  it('reads an explicit binary source base', () => {
    const out = conv('1010', '2');
    expect(line(out, 'Decimal:')).toBe('10');
    expect(line(out, 'Hex:')).toBe('a');
  });

  it('reads an explicit octal source base', () => {
    expect(line(conv('17', '8'), 'Decimal:')).toBe('15');
  });

  it('reads an explicit decimal source base', () => {
    expect(line(conv('100', '10'), 'Hex:')).toBe('64');
  });

  it('handles big integers beyond Number precision', () => {
    expect(conv('99999999999999999999')).toContain('Decimal:  99999999999999999999');
  });

  it('preserves a very large binary value as a round-trip via decimal', () => {
    const bin = '1'.repeat(256);
    const out = conv(bin, '2');
    expect(line(out, 'Binary:')).toBe(bin);
  });

  // --- output structure / determinism ---
  it('always emits exactly four labelled lines in fixed order', () => {
    const lines = conv('42').split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0].startsWith('Decimal:')).toBe(true);
    expect(lines[1].startsWith('Hex:')).toBe(true);
    expect(lines[2].startsWith('Octal:')).toBe(true);
    expect(lines[3].startsWith('Binary:')).toBe(true);
  });

  it('is deterministic for the same input', () => {
    expect(conv('123456')).toBe(conv('123456'));
  });

  // --- value boundaries ---
  it('handles zero', () => {
    const out = conv('0');
    expect(line(out, 'Decimal:')).toBe('0');
    expect(line(out, 'Hex:')).toBe('0');
    expect(line(out, 'Octal:')).toBe('0');
    expect(line(out, 'Binary:')).toBe('0');
  });

  it('handles leading zeros in decimal input', () => {
    expect(line(conv('007', '10'), 'Decimal:')).toBe('7');
  });

  it('uppercase hex input is normalized via lowercasing', () => {
    expect(line(conv('0XFF'), 'Decimal:')).toBe('255');
  });

  it('uppercase explicit hex digits are accepted', () => {
    expect(line(conv('FF', '16'), 'Decimal:')).toBe('255');
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(line(conv('  ff  ', '16'), 'Decimal:')).toBe('255');
  });

  it('auto-detects after trimming whitespace around a 0x prefix', () => {
    expect(line(conv('   0x10  '), 'Decimal:')).toBe('16');
  });

  // --- error paths ---
  it('throws on an invalid binary digit', () => {
    expect(() => conv('12', '2')).toThrow();
  });

  it('throws on a hex letter out of range', () => {
    expect(() => conv('g', '16')).toThrow(/Invalid digit/);
  });

  it('throws on empty input', () => {
    expect(() => conv('')).toThrow('Enter a number.');
  });

  it('throws on whitespace-only input', () => {
    expect(() => conv('   ')).toThrow('Enter a number.');
  });

  it('throws on negative numbers (sign char is not a digit)', () => {
    expect(() => conv('-5', '10')).toThrow(/Invalid digit/);
  });

  it('throws on internal whitespace / separators', () => {
    expect(() => conv('1 0', '10')).toThrow(/Invalid digit/);
  });

  it('throws when an explicit base does not strip the 0x prefix', () => {
    // with from='16' the 0x is treated literally; 'x' is not a hex digit
    expect(() => conv('0xff', '16')).toThrow(/Invalid digit/);
  });

  it('throws on emoji / unicode input', () => {
    expect(() => conv('🚀', '10')).toThrow(/Invalid digit/);
  });

  it('throws on an octal digit out of range', () => {
    expect(() => conv('8', '8')).toThrow(/Invalid digit/);
  });

  // --- round-trip across representations ---
  it('hex output round-trips back through hex parsing', () => {
    const hex = line(conv('48879', '10'), 'Hex:');
    expect(hex).toBe('beef');
    expect(line(conv(hex!, '16'), 'Decimal:')).toBe('48879');
  });

  it('binary output round-trips back through binary parsing', () => {
    const bin = line(conv('170', '10'), 'Binary:');
    expect(bin).toBe('10101010');
    expect(line(conv(bin!, '2'), 'Decimal:')).toBe('170');
  });
});

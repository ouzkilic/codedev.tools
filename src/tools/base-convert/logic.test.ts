import { describe, it, expect } from 'vitest';
import { baseConvertLogic } from './logic';

const conv = (s: string, from = 'auto') =>
  baseConvertLogic.transform(s, { options: { from }, secondary: '' });

describe('baseConvert', () => {
  it('converts decimal to all bases', () => {
    const out = conv('255');
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
  it('reads an explicit source base', () => {
    expect(conv('ff', '16')).toContain('Decimal:  255');
  });
  it('handles big integers beyond Number precision', () => {
    expect(conv('99999999999999999999')).toContain('Decimal:  99999999999999999999');
  });
  it('throws on an invalid digit', () => {
    expect(() => conv('12', '2')).toThrow();
  });
});

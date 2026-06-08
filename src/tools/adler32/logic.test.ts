import { describe, it, expect } from 'vitest';
import { adler32, adler32Logic } from './logic';

describe('adler32', () => {
  it('computes the Wikipedia example', () => {
    expect(adler32('Wikipedia')).toBe(0x11e60398);
    expect(adler32('Wikipedia')).toBe(300286872);
  });

  it('computes the hex of "abc"', () => {
    expect(adler32('abc').toString(16).padStart(8, '0')).toBe('024d0127');
  });

  it('returns 1 for empty input', () => {
    expect(adler32('')).toBe(1);
  });

  it('output contains the hex value', () => {
    const out = adler32Logic.transform('abc', { options: {}, secondary: '' });
    expect(out).toContain('024d0127');
    expect(out).toContain('Decimal:');
  });
});

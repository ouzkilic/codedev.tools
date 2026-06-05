import { describe, it, expect } from 'vitest';
import { charInfoLogic } from './logic';

describe('charInfo', () => {
  it('describes a character', () => {
    const out = charInfoLogic.transform('A');
    expect(out).toContain('Decimal:    65');
    expect(out).toContain('Hex:        0x41');
    expect(out).toContain('U+0041');
  });
  it('accepts a decimal code point', () => {
    expect(charInfoLogic.transform('65')).toContain('Character:  A');
  });
  it('accepts a hex code point', () => {
    expect(charInfoLogic.transform('0x41')).toContain('Character:  A');
  });
  it('handles emoji (astral plane)', () => {
    expect(charInfoLogic.transform('😀')).toContain('Decimal:    128512');
  });
});

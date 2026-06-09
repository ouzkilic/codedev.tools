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

  it('emits all seven labeled lines in order for "A"', () => {
    const out = charInfoLogic.transform('A');
    expect(out).toBe(
      [
        'Character:  A',
        'Decimal:    65',
        'Hex:        0x41',
        'Octal:      0o101',
        'Binary:     1000001',
        'HTML:       &#65;',
        'Unicode:    U+0041',
      ].join('\n'),
    );
    expect(out.split('\n')).toHaveLength(7);
  });

  it('decimal, hex (lowercase 0x), and the literal char all agree for "A"', () => {
    const fromChar = charInfoLogic.transform('A');
    const fromDec = charInfoLogic.transform('65');
    const fromHex = charInfoLogic.transform('0x41');
    expect(fromChar).toBe(fromDec);
    expect(fromDec).toBe(fromHex);
  });

  it('is deterministic / idempotent for the same input', () => {
    expect(charInfoLogic.transform('z')).toBe(charInfoLogic.transform('z'));
    const out = charInfoLogic.transform('z');
    expect(out).toContain('Decimal:    122');
    expect(out).toContain('Hex:        0x7A');
    expect(out).toContain('Octal:      0o172');
    expect(out).toContain('Unicode:    U+007A');
  });

  it('handles the NUL code point (0) with zero-padded unicode', () => {
    const out = charInfoLogic.transform('0');
    expect(out).toContain('Decimal:    0');
    expect(out).toContain('Hex:        0x0');
    expect(out).toContain('Octal:      0o0');
    expect(out).toContain('Binary:     0');
    expect(out).toContain('HTML:       &#0;');
    expect(out).toContain('Unicode:    U+0000');
  });

  it('treats hex parsing as case-insensitive (0xff)', () => {
    const lower = charInfoLogic.transform('0xff');
    const upper = charInfoLogic.transform('0xFF');
    const dec = charInfoLogic.transform('255');
    expect(lower).toBe(upper);
    expect(upper).toBe(dec);
    expect(dec).toContain('Decimal:    255');
    expect(dec).toContain('Hex:        0xFF');
    expect(dec).toContain('Octal:      0o377');
    expect(dec).toContain('Binary:     11111111');
    expect(dec).toContain('Unicode:    U+00FF');
  });

  it('hex output is always rendered uppercase regardless of input case', () => {
    expect(charInfoLogic.transform('0xff')).toContain('Hex:        0xFF');
  });

  it('trims surrounding whitespace before interpreting input', () => {
    const padded = charInfoLogic.transform('  B  ');
    expect(padded).toBe(charInfoLogic.transform('B'));
    expect(padded).toContain('Decimal:    66');
  });

  it('uses the first code point when given a multi-character string', () => {
    // "ABC" -> first char 'A' (65)
    expect(charInfoLogic.transform('ABC')).toContain('Decimal:    65');
    // leading space is trimmed, so first char is 'a' (97)
    expect(charInfoLogic.transform('  abc def')).toContain('Decimal:    97');
  });

  it('handles emoji fully (astral plane code point and unicode formatting)', () => {
    const out = charInfoLogic.transform('😀');
    expect(out).toContain('Character:  😀');
    expect(out).toContain('Decimal:    128512');
    expect(out).toContain('Hex:        0x1F600');
    expect(out).toContain('Unicode:    U+1F600');
    expect(out).toContain('HTML:       &#128512;');
  });

  it('reads only the first full code point of an emoji pair (no surrogate splitting)', () => {
    // "😀😀" should still report a single 128512, not a lone surrogate
    expect(charInfoLogic.transform('😀😀')).toContain('Decimal:    128512');
  });

  it('handles a non-emoji astral plane character (𝕏 U+1D54F)', () => {
    const out = charInfoLogic.transform('𝕏');
    expect(out).toContain('Decimal:    120143');
    expect(out).toContain('Unicode:    U+1D54F');
  });

  it('round-trips: decimal -> reported hex -> same decimal', () => {
    // 255 reported as 0xFF; feeding 0xFF back yields 255 again
    const first = charInfoLogic.transform('255');
    expect(first).toContain('Hex:        0xFF');
    const second = charInfoLogic.transform('0xFF');
    expect(second).toContain('Decimal:    255');
  });

  it('round-trips: char -> reported decimal -> same char', () => {
    // 'z' -> 122 -> 'z'
    expect(charInfoLogic.transform('z')).toContain('Decimal:    122');
    expect(charInfoLogic.transform('122')).toContain('Character:  z');
  });

  it('parses leading-zero decimals as base-10 (007 -> 7, not octal)', () => {
    const out = charInfoLogic.transform('007');
    expect(out).toContain('Decimal:    7');
    expect(out).toContain('Unicode:    U+0007');
  });

  it('parses "00" as code point 0', () => {
    expect(charInfoLogic.transform('00')).toContain('Decimal:    0');
  });

  it('handles the maximum valid Unicode code point (U+10FFFF) via decimal and hex', () => {
    const dec = charInfoLogic.transform('1114111');
    const hex = charInfoLogic.transform('0x10FFFF');
    expect(dec).toBe(hex);
    expect(dec).toContain('Hex:        0x10FFFF');
    expect(dec).toContain('Unicode:    U+10FFFF');
  });

  it('falls back to the first code point when "0x" is followed by a non-hex digit', () => {
    // "0xg" fails both the hex and decimal regexes, so the first code point '0' (48) is used
    const out = charInfoLogic.transform('0xg');
    expect(out).toContain('Decimal:    48');
    expect(out).toContain('Character:  0');
  });

  it('treats a leading minus as the literal "-" character (45), not a negative number', () => {
    const out = charInfoLogic.transform('-5');
    expect(out).toContain('Decimal:    45');
    expect(out).toContain('Character:  -');
  });

  it('throws a friendly error on empty input', () => {
    expect(() => charInfoLogic.transform('')).toThrow(
      'Enter a character, a decimal code, or 0x-prefixed hex.',
    );
  });

  it('throws a friendly error on whitespace-only input (trims to empty)', () => {
    expect(() => charInfoLogic.transform('   ')).toThrow(
      'Enter a character, a decimal code, or 0x-prefixed hex.',
    );
    expect(() => charInfoLogic.transform('\t')).toThrow();
    expect(() => charInfoLogic.transform('\n  \t')).toThrow();
  });

  it('throws when given a decimal code point above the Unicode maximum', () => {
    // 1114112 (U+10FFFF + 1) passes the NaN guard but String.fromCodePoint rejects it.
    expect(() => charInfoLogic.transform('1114112')).toThrow();
  });

  it('handles a large but valid input string by only reading its first code point', () => {
    const big = 'x'.repeat(100000);
    const out = charInfoLogic.transform(big);
    expect(out).toContain('Decimal:    120');
    expect(out).toContain('Character:  x');
  });
});

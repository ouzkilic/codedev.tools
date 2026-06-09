import { describe, it, expect } from 'vitest';
import { binaryLogic } from './logic';

const enc = (s: string) => binaryLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => binaryLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('binary - encode', () => {
  it('encodes text to space-separated bytes', () => {
    expect(enc('hi')).toBe('01101000 01101001');
  });

  it('encodes a single ASCII letter to one 8-bit byte', () => {
    expect(enc('A')).toBe('01000001');
  });

  it('encodes a space character', () => {
    expect(enc(' ')).toBe('00100000');
  });

  it('encodes the digit "0" (distinct from empty input)', () => {
    expect(enc('0')).toBe('00110000');
  });

  it('encodes multiple characters separated by single spaces', () => {
    expect(enc('AB')).toBe('01000001 01000010');
  });

  it('encodes control characters like newline', () => {
    expect(enc('\n')).toBe('00001010');
  });

  it('encodes empty string to empty string', () => {
    expect(enc('')).toBe('');
  });

  it('encodes multi-byte UTF-8 (e-acute = 2 bytes)', () => {
    expect(enc('é')).toBe('11000011 10101001');
  });

  it('encodes an emoji as 4 UTF-8 bytes', () => {
    expect(enc('\u{1F600}')).toBe('11110000 10011111 10011000 10000000');
  });

  it('produces only 8-bit groups separated by single spaces', () => {
    const input = 'Hello, World! 123';
    const out = enc(input);
    const groups = out.split(' ');
    for (const g of groups) {
      expect(g).toMatch(/^[01]{8}$/);
    }
    // Pure-ASCII string: one byte per character.
    expect(groups).toHaveLength(input.length);
  });

  it('is deterministic for the same input', () => {
    expect(enc('determinism')).toBe(enc('determinism'));
  });

  it('handles a very large input and yields the correct byte count', () => {
    const big = 'x'.repeat(5000);
    const out = enc(big);
    expect(out.split(' ')).toHaveLength(5000);
  });
});

describe('binary - decode', () => {
  it('decodes binary back to text', () => {
    expect(dec('01101000 01101001')).toBe('hi');
  });

  it('decodes a single byte', () => {
    expect(dec('01000001')).toBe('A');
  });

  it('decodes empty string to empty string', () => {
    expect(dec('')).toBe('');
  });

  it('decodes whitespace-only input to empty string', () => {
    expect(dec('   \n\t  ')).toBe('');
  });

  it('tolerates leading and trailing whitespace', () => {
    expect(dec('   01000001   ')).toBe('A');
  });

  it('tolerates mixed whitespace between groups', () => {
    expect(dec('01000001\t\n  01000010')).toBe('AB');
  });

  it('accepts a short 1-bit group "0" which decodes to the NUL byte', () => {
    const out = dec('0');
    expect(out).toHaveLength(1);
    expect(out.charCodeAt(0)).toBe(0);
  });

  it('accepts a short 7-bit group as a value below 0x80', () => {
    // parseInt('1010100', 2) === 84 === 'T'
    expect(dec('1010100')).toBe('T');
  });

  it('decodes multi-byte UTF-8 sequences', () => {
    expect(dec('11000011 10101001')).toBe('é');
  });
});

describe('binary - errors', () => {
  it('throws on an invalid binary digit', () => {
    expect(() => dec('0110 2222')).toThrow();
  });

  it('throws with a descriptive message naming the bad byte', () => {
    expect(() => dec('0110 2222')).toThrow(/Invalid binary byte/);
  });

  it('throws on a group longer than 8 bits', () => {
    expect(() => dec('010000010')).toThrow();
  });

  it('throws on non-binary characters mixed into a group', () => {
    expect(() => dec('0100000a')).toThrow();
  });
});

describe('binary - round trips & options', () => {
  it('round-trips UTF-8 text', () => {
    expect(dec(enc('café'))).toBe('café');
  });

  it('round-trips an emoji', () => {
    expect(dec(enc('\u{1F600}'))).toBe('\u{1F600}');
  });

  it('round-trips mixed ASCII, punctuation and digits', () => {
    const original = 'Hello, World! 42 #@$%';
    expect(dec(enc(original))).toBe(original);
  });

  it('round-trips multi-line text with control chars', () => {
    const original = 'line1\nline2\ttabbed';
    expect(dec(enc(original))).toBe(original);
  });

  it('defaults to encode mode when no context is provided', () => {
    expect(binaryLogic.transform('A')).toBe('01000001');
  });

  it('defaults to encode mode when mode is unset in options', () => {
    expect(binaryLogic.transform('A', { options: {}, secondary: '' })).toBe('01000001');
  });

  it('exposes a single "mode" select option with encode default', () => {
    const modeOpt = binaryLogic.options?.find((o) => o.key === 'mode');
    expect(modeOpt).toBeDefined();
    expect(modeOpt?.type).toBe('select');
    expect(modeOpt?.default).toBe('encode');
    expect(modeOpt?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
  });
});

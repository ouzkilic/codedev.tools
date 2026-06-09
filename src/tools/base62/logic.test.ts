import { describe, it, expect } from 'vitest';
import { base62Logic } from './logic';
import type { ToolContext } from '@/hooks/useToolState';

const enc = (s: string) => base62Logic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => base62Logic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('base62 - option metadata', () => {
  it('exposes a single mode select option defaulting to encode', () => {
    expect(base62Logic.options).toHaveLength(1);
    const mode = base62Logic.options?.[0];
    expect(mode?.key).toBe('mode');
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('encode');
    expect(mode?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
  });
});

describe('base62 - mode dispatch', () => {
  it('defaults to encode when no context is provided', () => {
    expect(base62Logic.transform('A')).toBe('13');
  });
  it('defaults to encode when options object is empty', () => {
    const ctx = { options: {}, secondary: '' } as ToolContext;
    expect(base62Logic.transform('A', ctx)).toBe('13');
  });
  it('encodes when mode is encode', () => {
    expect(enc('A')).toBe('13');
  });
  it('decodes when mode is decode', () => {
    expect(dec('13')).toBe('A');
  });
});

describe('base62 - encode happy paths', () => {
  it('only uses alphanumeric characters', () => {
    expect(enc('Hello World')).toMatch(/^[0-9A-Za-z]+$/);
  });
  it('encodes a known single char', () => {
    // 'A' -> byte 65 -> 65 = 1*62 + 3 -> "13"
    expect(enc('A')).toBe('13');
  });
  it('encodes a known word', () => {
    expect(enc('Hello')).toBe('5TP3P3v');
  });
  it('encodes the literal character "0" without zero-prefix handling', () => {
    // byte for '0' is 48, not 0, so no leading "0" is emitted
    expect(enc('0')).toBe('m');
  });
  it('is deterministic across repeated calls', () => {
    expect(enc('codedev.tools')).toBe(enc('codedev.tools'));
  });
});

describe('base62 - empty and whitespace', () => {
  it('encodes empty string to empty string', () => {
    expect(enc('')).toBe('');
  });
  it('decodes empty string to empty string', () => {
    expect(dec('')).toBe('');
  });
  it('decodes whitespace-only input to empty string (trimmed)', () => {
    expect(dec('   ')).toBe('');
    expect(dec('\t\n ')).toBe('');
  });
  it('trims surrounding whitespace before decoding', () => {
    expect(dec('  13  ')).toBe('A');
  });
  it('round-trips a whitespace-only string', () => {
    expect(dec(enc('   '))).toBe('   ');
  });
});

describe('base62 - round trips', () => {
  const samples = [
    'A',
    'a',
    'Hello World',
    'codedev.tools',
    'The quick brown fox',
    '1234567890',
    'café ☕',
    '🎉🎊',
    ' abc',
    'abc ',
  ];
  for (const s of samples) {
    it(`round-trips ${JSON.stringify(s)}`, () => {
      expect(dec(enc(s))).toBe(s);
    });
  }
  it('round-trips UTF-8 multibyte', () => {
    expect(dec(enc('café ☕'))).toBe('café ☕');
  });
  it('round-trips emoji (surrogate pairs)', () => {
    expect(dec(enc('🎉🎊'))).toBe('🎉🎊');
  });
});

describe('base62 - known encodings (exact)', () => {
  it('encodes "Hello World" to a stable value', () => {
    expect(enc('Hello World')).toBe('73XpUgyMwkGr29M');
  });
  it('encodes "codedev.tools" to a stable value', () => {
    expect(enc('codedev.tools')).toBe('2fFkxQgwGYMEu5MWSB');
  });
  it('decodes lowercase "a" (alphabet index 36) to "$"', () => {
    // 'a' has index 36 in the alphabet; 36 maps to byte 36 = '$'
    expect(dec('a')).toBe('$');
  });
});

describe('base62 - large input', () => {
  it('round-trips a very large string', () => {
    const big = 'x'.repeat(5000);
    expect(dec(enc(big))).toBe(big);
  });
  it('produces alphanumeric-only output for large input', () => {
    const big = 'codedev'.repeat(1000);
    expect(enc(big)).toMatch(/^[0-9A-Za-z]+$/);
  });
});

describe('base62 - error paths', () => {
  it('throws on invalid characters (hyphen)', () => {
    expect(() => dec('hello-world')).toThrow();
  });
  it('reports the offending character in the error message', () => {
    expect(() => dec('ab-cd')).toThrow(/Invalid Base62 character/);
  });
  it('throws on punctuation that is not in the alphabet', () => {
    expect(() => dec('@')).toThrow();
    expect(() => dec('!')).toThrow();
    expect(() => dec('=')).toThrow();
  });
  it('throws on non-ascii input when decoding', () => {
    expect(() => dec('café')).toThrow();
  });
  it('does not throw on a fully valid alphanumeric decode input', () => {
    expect(() => dec('AbZ09')).not.toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { base64Logic } from './logic';

const ctx = (mode: string): ToolContext => ({ options: { mode }, secondary: '' });
const enc = (s: string) => base64Logic.transform(s, ctx('encode'));
const dec = (s: string) => base64Logic.transform(s, ctx('decode'));

describe('base64 - options metadata', () => {
  it('exposes a single mode select option with encode/decode choices', () => {
    expect(base64Logic.options).toBeDefined();
    const mode = base64Logic.options?.find((o) => o.key === 'mode');
    expect(mode).toBeDefined();
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('encode');
    expect(mode?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
  });
});

describe('base64 - encode', () => {
  it('encodes ASCII text', () => {
    expect(enc('hello')).toBe('aGVsbG8=');
  });

  it('encodes empty string to empty string', () => {
    expect(enc('')).toBe('');
  });

  it('produces correct padding for 1-byte input', () => {
    expect(enc('A')).toBe('QQ==');
  });

  it('produces correct padding for 2-byte input', () => {
    expect(enc('AB')).toBe('QUI=');
  });

  it('produces no padding for 3-byte input', () => {
    expect(enc('ABC')).toBe('QUJD');
  });

  it('encodes a single space', () => {
    expect(enc(' ')).toBe('IA==');
  });

  it('encodes numeric string', () => {
    expect(enc('123')).toBe('MTIz');
  });

  it('encodes whitespace/newline characters literally', () => {
    expect(enc('a\nb')).toBe('YQpi');
  });

  it('encodes multibyte UTF-8 (accents, em dash, euro)', () => {
    expect(enc('café — €')).toBe('Y2Fmw6kg4oCUIOKCrA==');
  });

  it('encodes a 4-byte emoji code point', () => {
    expect(enc('😀')).toBe('8J+YgA==');
  });

  it('is deterministic for the same input', () => {
    expect(enc('determinism')).toBe(enc('determinism'));
  });
});

describe('base64 - decode', () => {
  it('decodes back to ASCII text', () => {
    expect(dec('aGVsbG8=')).toBe('hello');
  });

  it('decodes empty string to empty string', () => {
    expect(dec('')).toBe('');
  });

  it('trims leading/trailing whitespace before decoding', () => {
    expect(dec('  aGVsbG8=  ')).toBe('hello');
    expect(dec('\n\taGVsbG8=\t\n')).toBe('hello');
  });

  it('ignores internal whitespace in the encoded payload', () => {
    expect(dec('aGV sbG8=')).toBe('hello');
  });

  it('decodes payloads without trailing padding', () => {
    expect(dec('aGVsbG8')).toBe('hello');
  });

  it('throws on invalid Base64 alphabet characters', () => {
    expect(() => dec('!!!not base64!!!')).toThrow();
  });

  it('throws on a payload of only padding characters', () => {
    expect(() => dec('====')).toThrow();
  });
});

describe('base64 - mode selection', () => {
  it('defaults to encode when no context is provided', () => {
    expect(base64Logic.transform('hello')).toBe('aGVsbG8=');
  });

  it('defaults to encode when mode is undefined in options', () => {
    expect(base64Logic.transform('hello', { options: {}, secondary: '' })).toBe('aGVsbG8=');
  });

  it('treats any non-decode mode value as encode', () => {
    expect(base64Logic.transform('hello', ctx('something-else'))).toBe('aGVsbG8=');
  });

  it('uses decode only when mode is exactly "decode"', () => {
    expect(base64Logic.transform('aGVsbG8=', ctx('decode'))).toBe('hello');
  });
});

describe('base64 - round trips', () => {
  it('round-trips UTF-8 text (encode then decode)', () => {
    expect(dec(enc('café — €'))).toBe('café — €');
  });

  it('round-trips repeated emoji', () => {
    expect(dec(enc('😀😀😀'))).toBe('😀😀😀');
  });

  it('round-trips an empty string', () => {
    expect(dec(enc(''))).toBe('');
  });

  it('round-trips special/punctuation characters', () => {
    const s = '~!@#$%^&*()_+-=[]{}|;:\'",.<>/?`';
    expect(dec(enc(s))).toBe(s);
  });

  it('round-trips a very large input', () => {
    const big = 'A'.repeat(10000);
    const encoded = enc(big);
    expect(encoded.length).toBeGreaterThan(13000);
    expect(dec(encoded)).toBe(big);
  });
});

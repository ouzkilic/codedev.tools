import { describe, it, expect } from 'vitest';
import { base32Logic } from './logic';

const enc = (s: string) => base32Logic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => base32Logic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('base32 metadata', () => {
  it('exposes a single mode select option defaulting to encode', () => {
    expect(base32Logic.options).toHaveLength(1);
    const opt = base32Logic.options![0];
    expect(opt.key).toBe('mode');
    expect(opt.type).toBe('select');
    expect(opt.default).toBe('encode');
    expect(opt.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
  });

  it('defaults to encode when no context is supplied', () => {
    expect(base32Logic.transform('f')).toBe('MY======');
  });

  it('defaults to encode when mode is missing from options', () => {
    expect(base32Logic.transform('f', { options: {}, secondary: '' })).toBe('MY======');
  });
});

describe('base32 encode (RFC 4648 vectors)', () => {
  it('encodes the empty string to the empty string', () => {
    expect(enc('')).toBe('');
  });
  it('encodes "f"', () => {
    expect(enc('f')).toBe('MY======');
  });
  it('encodes "fo"', () => {
    expect(enc('fo')).toBe('MZXQ====');
  });
  it('encodes "foo"', () => {
    expect(enc('foo')).toBe('MZXW6===');
  });
  it('encodes "foob"', () => {
    expect(enc('foob')).toBe('MZXW6YQ=');
  });
  it('encodes "fooba" (no padding needed)', () => {
    expect(enc('fooba')).toBe('MZXW6YTB');
  });
  it('encodes "foobar"', () => {
    expect(enc('foobar')).toBe('MZXW6YTBOI======');
  });
  it('encodes a single uppercase "A"', () => {
    expect(enc('A')).toBe('IE======');
  });
});

describe('base32 encode (edge cases & properties)', () => {
  it('encodes a longer ASCII string exactly', () => {
    expect(enc('Hello, World!')).toBe('JBSWY3DPFQQFO33SNRSCC===');
  });
  it('encodes whitespace-only input (does not strip on encode)', () => {
    expect(enc('   ')).toBe('EAQCA===');
  });
  it('encodes multi-byte UTF-8 (café)', () => {
    expect(enc('café')).toBe('MNQWNQ5J');
  });
  it('encodes an emoji (4-byte UTF-8)', () => {
    expect(enc('🎉')).toBe('6CPY5CI=');
  });
  it('produces output whose length is always a multiple of 8 for non-empty input', () => {
    for (const s of ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef', 'abcdefg']) {
      expect(enc(s).length % 8).toBe(0);
    }
  });
  it('uses only RFC 4648 alphabet characters plus padding', () => {
    expect(enc('The quick brown fox')).toMatch(/^[A-Z2-7]+=*$/);
  });
  it('is deterministic for the same input', () => {
    expect(enc('determinism')).toBe(enc('determinism'));
  });
});

describe('base32 decode', () => {
  it('decodes the empty string to the empty string', () => {
    expect(dec('')).toBe('');
  });
  it('decodes back to text', () => {
    expect(dec('MZXW6YTBOI======')).toBe('foobar');
  });
  it('decodes input without trailing padding', () => {
    expect(dec('MZXW6YTBOI')).toBe('foobar');
  });
  it('decodes case-insensitively (lowercase accepted)', () => {
    expect(dec('mzxw6ytboi')).toBe('foobar');
  });
  it('ignores internal whitespace', () => {
    expect(dec('MZXW 6YTB\nOI======')).toBe('foobar');
  });
  it('ignores leading/trailing whitespace', () => {
    expect(dec('  MZXW6YTBOI  ')).toBe('foobar');
  });
});

describe('base32 decode errors', () => {
  it('throws on the invalid digit "0"', () => {
    expect(() => dec('0189')).toThrow(/Invalid Base32 character: '0'/);
  });
  it('throws on the invalid digit "1"', () => {
    expect(() => dec('1')).toThrow(/Invalid Base32 character/);
  });
  it('throws on special characters', () => {
    expect(() => dec('MZXW!YTB')).toThrow(/Invalid Base32 character: '!'/);
  });
});

describe('base32 round-trips', () => {
  it('round-trips UTF-8 accented text', () => {
    expect(dec(enc('café'))).toBe('café');
  });
  it('round-trips emoji', () => {
    expect(dec(enc('🎉'))).toBe('🎉');
  });
  it('round-trips every input length 0..16 (padding-boundary coverage)', () => {
    for (let n = 0; n <= 16; n++) {
      const s = 'x'.repeat(n);
      expect(dec(enc(s))).toBe(s);
    }
  });
  it('round-trips a large input', () => {
    const big = 'a'.repeat(10000);
    expect(dec(enc(big))).toBe(big);
  });
  it('round-trips mixed unicode and ascii', () => {
    const s = 'Görüş — naïve café 🍕 résumé';
    expect(dec(enc(s))).toBe(s);
  });
});

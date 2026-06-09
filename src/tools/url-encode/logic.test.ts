import { describe, it, expect } from 'vitest';
import { urlEncodeLogic } from './logic';

const enc = (s: string) => urlEncodeLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => urlEncodeLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('urlEncode', () => {
  it('percent-encodes spaces and reserved characters', () => {
    expect(enc('a b&c=d')).toBe('a%20b%26c%3Dd');
  });

  it('decodes back to the original', () => {
    expect(dec('a%20b%26c%3Dd')).toBe('a b&c=d');
  });

  it('round-trips UTF-8', () => {
    expect(dec(enc('café'))).toBe('café');
  });

  it('throws on malformed escape sequences when decoding', () => {
    expect(() => dec('%')).toThrow();
  });

  it('defaults to encode when no options are provided', () => {
    expect(urlEncodeLogic.transform('a b')).toBe('a%20b');
  });

  it('defaults to encode when ctx is provided without a mode', () => {
    expect(urlEncodeLogic.transform('a b', { options: {}, secondary: '' })).toBe('a%20b');
  });

  it('treats an unknown mode value as non-decode, falling back to encode', () => {
    expect(urlEncodeLogic.transform('a b', { options: { mode: 'wat' }, secondary: '' })).toBe('a%20b');
  });

  it('encodes an empty string to an empty string', () => {
    expect(enc('')).toBe('');
  });

  it('decodes an empty string to an empty string', () => {
    expect(dec('')).toBe('');
  });

  it('leaves unreserved characters untouched when encoding', () => {
    // encodeURIComponent never escapes A-Z a-z 0-9 - _ . ! ~ * ' ( )
    const unreserved = "ABCabc123-_.!~*'()";
    expect(enc(unreserved)).toBe(unreserved);
  });

  it('encodes all the URI reserved characters', () => {
    expect(enc(';,/?:@&=+$#')).toBe('%3B%2C%2F%3F%3A%40%26%3D%2B%24%23');
  });

  it('encodes whitespace characters distinctly', () => {
    expect(enc(' \t\n')).toBe('%20%09%0A');
  });

  it('encodes unicode characters as UTF-8 percent sequences', () => {
    // é is U+00E9 -> UTF-8 C3 A9
    expect(enc('é')).toBe('%C3%A9');
  });

  it('encodes emoji using their multi-byte UTF-8 representation', () => {
    // 😀 U+1F600 -> UTF-8 F0 9F 98 80
    expect(enc('😀')).toBe('%F0%9F%98%80');
    expect(dec('%F0%9F%98%80')).toBe('😀');
  });

  it('round-trips emoji and mixed content', () => {
    const mixed = 'hello 世界 😀 & <tag> ?a=1';
    expect(dec(enc(mixed))).toBe(mixed);
  });

  it('decoding is the inverse of encoding for arbitrary text', () => {
    const samples = ['', ' ', 'plain', 'a+b', '100%', 'çığöşü', 'key=value&x=y'];
    for (const s of samples) {
      expect(dec(enc(s))).toBe(s);
    }
  });

  it('does not decode a literal plus sign into a space', () => {
    // unlike form-encoding, decodeURIComponent leaves '+' as '+'
    expect(dec('a+b')).toBe('a+b');
  });

  it('throws when decoding a truncated percent sequence', () => {
    expect(() => dec('%E0%A4')).toThrow();
  });

  it('throws when decoding non-hex characters after a percent', () => {
    expect(() => dec('%ZZ')).toThrow();
  });

  it('handles a large input without altering safe characters', () => {
    const big = 'x'.repeat(100000);
    const out = enc(big);
    expect(out).toBe(big);
    expect(out.length).toBe(100000);
  });

  it('encoding is idempotent only across an encode/decode pair, not double-encode', () => {
    const once = enc('a b');
    expect(once).toBe('a%20b');
    // double-encoding escapes the percent sign itself
    expect(enc(once)).toBe('a%2520b');
    // and a single decode unwinds exactly one layer
    expect(dec(enc(once))).toBe(once);
  });
});

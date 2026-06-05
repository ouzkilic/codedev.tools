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
});

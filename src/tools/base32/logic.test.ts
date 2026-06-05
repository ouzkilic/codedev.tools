import { describe, it, expect } from 'vitest';
import { base32Logic } from './logic';

const enc = (s: string) => base32Logic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => base32Logic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('base32', () => {
  it('encodes RFC 4648 test vectors', () => {
    expect(enc('f')).toBe('MY======');
    expect(enc('foobar')).toBe('MZXW6YTBOI======');
  });
  it('decodes back to text', () => {
    expect(dec('MZXW6YTBOI======')).toBe('foobar');
  });
  it('round-trips UTF-8', () => {
    expect(dec(enc('café'))).toBe('café');
  });
  it('throws on invalid characters', () => {
    expect(() => dec('0189')).toThrow();
  });
});

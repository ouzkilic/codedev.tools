import { describe, it, expect } from 'vitest';
import { base64Logic } from './logic';

const enc = (s: string) => base64Logic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => base64Logic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('base64', () => {
  it('encodes ASCII text', () => {
    expect(enc('hello')).toBe('aGVsbG8=');
  });
  it('decodes back to text', () => {
    expect(dec('aGVsbG8=')).toBe('hello');
  });
  it('handles UTF-8 round-trip', () => {
    expect(dec(enc('café — €'))).toBe('café — €');
  });
  it('throws on invalid Base64 when decoding', () => {
    expect(() => dec('!!!not base64!!!')).toThrow();
  });
});

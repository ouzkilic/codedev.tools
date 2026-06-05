import { describe, it, expect } from 'vitest';
import { hexLogic } from './logic';

const enc = (s: string) => hexLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => hexLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('hex', () => {
  it('encodes ASCII to hex', () => {
    expect(enc('hi')).toBe('6869');
  });
  it('decodes hex back to text', () => {
    expect(dec('6869')).toBe('hi');
  });
  it('ignores whitespace when decoding', () => {
    expect(dec('68 69')).toBe('hi');
  });
  it('round-trips UTF-8', () => {
    expect(dec(enc('café'))).toBe('café');
  });
  it('throws on odd-length hex', () => {
    expect(() => dec('abc')).toThrow();
  });
  it('throws on non-hex characters', () => {
    expect(() => dec('zz')).toThrow();
  });
});

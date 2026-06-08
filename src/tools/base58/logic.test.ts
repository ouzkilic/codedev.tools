import { describe, it, expect } from 'vitest';
import { base58Logic } from './logic';

const enc = (s: string) => base58Logic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => base58Logic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('base58', () => {
  it('encodes a known string (Bitcoin alphabet)', () => {
    expect(enc('Hello World')).toBe('JxF12TrwUP45BMd');
  });
  it('round-trips text', () => {
    expect(dec(enc('codedev.tools'))).toBe('codedev.tools');
  });
  it('round-trips UTF-8', () => {
    expect(dec(enc('café ☕'))).toBe('café ☕');
  });
  it('throws on invalid characters (0, O, I, l)', () => {
    expect(() => dec('0OIl')).toThrow();
  });
});

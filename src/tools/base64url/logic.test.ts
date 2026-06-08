import { describe, it, expect } from 'vitest';
import { base64urlLogic } from './logic';

const enc = (input: string) =>
  base64urlLogic.transform(input, { options: { mode: 'encode' }, secondary: '' });
const dec = (input: string) =>
  base64urlLogic.transform(input, { options: { mode: 'decode' }, secondary: '' });

describe('base64urlLogic', () => {
  it('encodes hello without padding', () => {
    expect(enc('hello')).toBe('aGVsbG8');
  });

  it('encodes unicode url-safely without + / or =', () => {
    const out = enc('café');
    expect(out).not.toMatch(/[+/=]/);
  });

  it('round-trips unicode', () => {
    const original = 'café ☕';
    expect(dec(enc(original))).toBe(original);
  });

  it('decodes aGVsbG8 to hello', () => {
    expect(dec('aGVsbG8')).toBe('hello');
  });

  it('defaults to encode mode', () => {
    expect(base64urlLogic.transform('hello', { options: {}, secondary: '' })).toBe('aGVsbG8');
  });

  it('throws on invalid decode input', () => {
    expect(() => dec('!!!!')).toThrow();
  });
});

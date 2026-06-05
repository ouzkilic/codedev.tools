import { describe, it, expect } from 'vitest';
import { binaryLogic } from './logic';

const enc = (s: string) => binaryLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => binaryLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('binary', () => {
  it('encodes text to space-separated bytes', () => {
    expect(enc('hi')).toBe('01101000 01101001');
  });
  it('decodes binary back to text', () => {
    expect(dec('01101000 01101001')).toBe('hi');
  });
  it('round-trips UTF-8', () => {
    expect(dec(enc('café'))).toBe('café');
  });
  it('throws on invalid binary', () => {
    expect(() => dec('0110 2222')).toThrow();
  });
});

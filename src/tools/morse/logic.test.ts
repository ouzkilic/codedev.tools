import { describe, it, expect } from 'vitest';
import { morseLogic } from './logic';

const enc = (input: string) =>
  morseLogic.transform(input, { options: { mode: 'encode' }, secondary: '' });
const dec = (input: string) =>
  morseLogic.transform(input, { options: { mode: 'decode' }, secondary: '' });

describe('morseLogic', () => {
  it('encodes SOS', () => {
    expect(enc('SOS')).toBe('... --- ...');
  });

  it('separates words with " / "', () => {
    expect(enc('HI THERE')).toContain(' / ');
  });

  it('round-trips HELLO', () => {
    expect(dec(enc('HELLO'))).toBe('HELLO');
  });

  it('encodes AB', () => {
    expect(enc('AB')).toBe('.- -...');
  });

  it('throws on invalid Morse token when decoding', () => {
    expect(() => dec('........')).toThrow();
  });
});

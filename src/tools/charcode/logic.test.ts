import { describe, it, expect } from 'vitest';
import { charcodeLogic } from './logic';

const enc = (s: string) =>
  charcodeLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) =>
  charcodeLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('charcode', () => {
  it('encodes text to decimal codes', () => {
    expect(enc('AB')).toBe('65 66');
  });
  it('encodes emoji code points', () => {
    expect(enc('A\u{1F600}')).toBe('65 128512');
  });
  it('decodes codes to text', () => {
    expect(dec('65 66')).toBe('AB');
  });
  it('round-trips encode', () => {
    expect(dec(enc('Hello \u{1F600}'))).toBe('Hello \u{1F600}');
  });
  it('throws on invalid code', () => {
    expect(() => dec('xx')).toThrow();
  });
});

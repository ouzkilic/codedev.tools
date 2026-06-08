import { describe, it, expect } from 'vitest';
import { punycodeLogic } from './logic';

const enc = (s: string) =>
  punycodeLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) =>
  punycodeLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('punycode', () => {
  it('encodes non-ASCII labels', () => {
    expect(enc('münchen')).toBe('xn--mnchen-3ya');
  });

  it('encodes multi-label hosts', () => {
    expect(enc('münchen.de')).toBe('xn--mnchen-3ya.de');
  });

  it('leaves ASCII hosts unchanged', () => {
    expect(enc('example.com')).toBe('example.com');
  });

  it('decodes punycode labels', () => {
    expect(dec('xn--mnchen-3ya')).toBe('münchen');
  });

  it('decodes multi-label hosts', () => {
    expect(dec('xn--mnchen-3ya.de')).toBe('münchen.de');
  });

  it('leaves non-punycode labels unchanged when decoding', () => {
    expect(dec('example.com')).toBe('example.com');
  });

  it('round-trips several inputs', () => {
    for (const s of ['münchen', 'bücher', 'café', '例え', 'δοκιμή', 'münchen.example.de']) {
      expect(dec(enc(s))).toBe(s);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { punycodeLogic } from './logic';

const enc = (s: string) =>
  punycodeLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) =>
  punycodeLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('punycode — encoding', () => {
  it('encodes a non-ASCII label with the xn-- prefix', () => {
    expect(enc('münchen')).toBe('xn--mnchen-3ya');
  });

  it('encodes multi-label hosts, only touching non-ASCII labels', () => {
    expect(enc('münchen.de')).toBe('xn--mnchen-3ya.de');
    expect(enc('sub.münchen.de')).toBe('sub.xn--mnchen-3ya.de');
  });

  it('leaves fully ASCII hosts unchanged', () => {
    expect(enc('example.com')).toBe('example.com');
    expect(enc('app')).toBe('app');
  });

  it('encodes assorted scripts to known RFC 3492 outputs', () => {
    expect(enc('café')).toBe('xn--caf-dma');
    expect(enc('δοκιμή')).toBe('xn--jxalpdlp');
    expect(enc('例え')).toBe('xn--r8jz45g');
    expect(enc('中文')).toBe('xn--fiq228c');
    expect(enc('ñ')).toBe('xn--ida');
  });

  it('encodes each label of a multi-script host independently', () => {
    expect(enc('例え.テスト')).toBe('xn--r8jz45g.xn--zckzah');
  });

  it('preserves the case of basic (ASCII) code points in a label', () => {
    expect(enc('Bücher')).toBe('xn--Bcher-kva');
    expect(enc('MÜNCHEN')).toBe('xn--MNCHEN-psa');
  });

  it('encodes astral-plane code points (emoji) via surrogate-safe decoding', () => {
    expect(enc('😀')).toBe('xn--e28h');
    expect(enc('😀😀')).toBe('xn--e28ha');
  });
});

describe('punycode — decoding', () => {
  it('decodes an xn-- label back to its Unicode form', () => {
    expect(dec('xn--mnchen-3ya')).toBe('münchen');
  });

  it('decodes multi-label hosts', () => {
    expect(dec('xn--mnchen-3ya.de')).toBe('münchen.de');
    expect(dec('sub.xn--mnchen-3ya.de')).toBe('sub.münchen.de');
  });

  it('leaves labels without the xn-- prefix unchanged', () => {
    expect(dec('example.com')).toBe('example.com');
    expect(dec('app')).toBe('app');
  });

  it('treats the xn-- prefix case-insensitively', () => {
    expect(dec('XN--mnchen-3ya')).toBe('münchen');
    expect(dec('Xn--mnchen-3ya')).toBe('münchen');
  });

  it('decodes a label whose body is empty (xn--) to an empty string', () => {
    expect(dec('xn--')).toBe('');
  });

  it('decodes "xn--a" to U+0080 (no delimiter, single delta digit)', () => {
    const out = dec('xn--a');
    expect(out).toHaveLength(1);
    expect(out.codePointAt(0)).toBe(0x80);
  });
});

describe('punycode — round trips and idempotency', () => {
  it('round-trips encode -> decode for a variety of inputs', () => {
    for (const s of [
      'münchen',
      'bücher',
      'café',
      '例え',
      'δοκιμή',
      'münchen.example.de',
      '😀',
      '😀😀',
      'Bücher',
      'MÜNCHEN',
      '中文',
      'ñ',
    ]) {
      expect(dec(enc(s))).toBe(s);
    }
  });

  it('encoding is idempotent on already-ASCII / already-encoded hosts', () => {
    const encoded = enc('münchen.de');
    expect(enc(encoded)).toBe(encoded);
  });

  it('is deterministic — same input yields same output across calls', () => {
    expect(enc('δοκιμή')).toBe(enc('δοκιμή'));
    expect(dec('xn--jxalpdlp')).toBe(dec('xn--jxalpdlp'));
  });

  it('round-trips a very large repeated-character label', () => {
    const big = 'ü'.repeat(500);
    const encoded = enc(big);
    expect(encoded.startsWith('xn--')).toBe(true);
    expect(dec(encoded)).toBe(big);
  });
});

describe('punycode — edge cases', () => {
  it('returns empty string for empty input in both modes', () => {
    expect(enc('')).toBe('');
    expect(dec('')).toBe('');
  });

  it('preserves whitespace-only ASCII input', () => {
    expect(enc('  ')).toBe('  ');
    expect(dec('  ')).toBe('  ');
  });

  it('preserves leading and trailing dot separators (empty labels)', () => {
    expect(enc('a.')).toBe('a.');
    expect(enc('.a')).toBe('.a');
    expect(dec('a.')).toBe('a.');
  });

  it('leaves bare delimiter characters untouched', () => {
    expect(enc('-')).toBe('-');
    expect(enc('--')).toBe('--');
    expect(dec('-')).toBe('-');
  });
});

describe('punycode — mode option', () => {
  it('defaults to encode when no context is provided', () => {
    expect(punycodeLogic.transform('münchen')).toBe('xn--mnchen-3ya');
  });

  it('defaults to encode when mode is absent from options', () => {
    expect(punycodeLogic.transform('münchen', { options: {}, secondary: '' })).toBe(
      'xn--mnchen-3ya',
    );
  });

  it('exposes a single select option (mode) with encode/decode choices', () => {
    expect(punycodeLogic.options).toHaveLength(1);
    const mode = punycodeLogic.options?.[0];
    expect(mode?.key).toBe('mode');
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('encode');
    expect(mode?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
  });
});

describe('punycode — error paths', () => {
  it('throws on a non-ASCII code point inside an xn-- body', () => {
    expect(() => dec('xn--mü')).toThrow();
  });

  it('throws on punycode overflow during decoding', () => {
    expect(() => dec('xn--99999999')).toThrow(/overflow/i);
  });

  it('throws on an xn-- label that ends mid-sequence', () => {
    expect(() => dec('xn--!!')).toThrow(/end of input/i);
  });
});

import { describe, it, expect } from 'vitest';
import { quotedPrintableLogic } from './logic';

const enc = (s: string) => quotedPrintableLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => quotedPrintableLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('quotedPrintable / encode', () => {
  it('encodes non-ASCII bytes as =XX', () => {
    expect(enc('café')).toBe('caf=C3=A9');
  });

  it('encodes the equals sign as =3D', () => {
    expect(enc('a=b')).toBe('a=3Db');
  });

  it('leaves plain printable ASCII untouched', () => {
    expect(enc('Hello World 123')).toBe('Hello World 123');
  });

  it('preserves spaces (byte 32) and tabs (byte 9) literally', () => {
    expect(enc(' \t ')).toBe(' \t ');
  });

  it('preserves all printable punctuation except equals', () => {
    // 33..126 minus '=' (61) all kept verbatim
    expect(enc('!"#$%&\'()*+,-./:;<>?@[\\]^_`{|}~')).toBe('!"#$%&\'()*+,-./:;<>?@[\\]^_`{|}~');
  });

  it('encodes control characters: newline -> =0A, CR -> =0D', () => {
    expect(enc('\n')).toBe('=0A');
    expect(enc('\r')).toBe('=0D');
    expect(enc('\r\n')).toBe('=0D=0A');
  });

  it('encodes NUL byte (0) as =00', () => {
    expect(enc(String.fromCharCode(0))).toBe('=00');
  });

  it('encodes DEL (127) as =7F since 127 is outside 33..126', () => {
    expect(enc(String.fromCharCode(127))).toBe('=7F');
  });

  it('uses uppercase hex with two-digit zero padding', () => {
    // U+00A9 (©) -> UTF-8 C2 A9
    expect(enc('©')).toBe('=C2=A9');
  });

  it('encodes emoji as its UTF-8 byte sequence', () => {
    // ☕ U+2615 -> E2 98 95
    expect(enc('☕')).toBe('=E2=98=95');
    // 😀 U+1F600 -> F0 9F 98 80
    expect(enc('😀')).toBe('=F0=9F=98=80');
  });

  it('returns empty string for empty input', () => {
    expect(enc('')).toBe('');
  });

  it('is deterministic across repeated calls', () => {
    expect(enc('Über=cool ☕')).toBe(enc('Über=cool ☕'));
  });
});

describe('quotedPrintable / decode', () => {
  it('decodes =XX sequences back to the original', () => {
    expect(dec('caf=C3=A9')).toBe('café');
  });

  it('decodes lowercase hex digits', () => {
    expect(dec('caf=c3=a9')).toBe('café');
  });

  it('decodes mixed-case hex digits', () => {
    expect(dec('caf=C3=a9')).toBe('café');
  });

  it('passes through plain printable text', () => {
    expect(dec('Hello World 123')).toBe('Hello World 123');
  });

  it('decodes =3D back to a literal equals sign', () => {
    expect(dec('a=3Db')).toBe('a=b');
  });

  it('treats a stray = with no valid hex as a literal = (byte 61)', () => {
    expect(dec('a=zb')).toBe('a=zb');
  });

  it('treats a trailing lone = (end of input, no hex) as literal =', () => {
    expect(dec('end=')).toBe('end=');
  });

  it('skips a soft line break "=\\n"', () => {
    expect(dec('abc=\ndef')).toBe('abcdef');
  });

  it('skips a soft line break "=\\r\\n"', () => {
    expect(dec('abc=\r\ndef')).toBe('abcdef');
  });

  it('returns empty string for empty input', () => {
    expect(dec('')).toBe('');
  });
});

describe('quotedPrintable / round-trips & properties', () => {
  it('round-trips unicode + equals + space', () => {
    expect(dec(enc('Über=cool ☕'))).toBe('Über=cool ☕');
  });

  it('round-trips a string of every ASCII byte 0..127', () => {
    let s = '';
    for (let i = 0; i < 128; i++) s += String.fromCharCode(i);
    expect(dec(enc(s))).toBe(s);
  });

  it('round-trips emoji and CJK', () => {
    const s = '😀漢字测试ñ';
    expect(dec(enc(s))).toBe(s);
  });

  it('round-trips a large input', () => {
    const s = 'café=☕ '.repeat(5000);
    expect(dec(enc(s))).toBe(s);
  });

  it('encode then decode is identity for mixed control/unicode', () => {
    const s = 'a=b\nc\td é';
    expect(dec(enc(s))).toBe(s);
  });

  it('decoding an already-plain string is a no-op', () => {
    const plain = 'no special chars here';
    expect(dec(plain)).toBe(plain);
  });
});

describe('quotedPrintable / option handling', () => {
  it('defaults to encode when mode is omitted', () => {
    expect(quotedPrintableLogic.transform('a=b', { options: {}, secondary: '' })).toBe('a=3Db');
  });

  it('defaults to encode when ctx is undefined', () => {
    expect(quotedPrintableLogic.transform('a=b', undefined as never)).toBe('a=3Db');
  });

  it('honors mode=decode explicitly', () => {
    expect(quotedPrintableLogic.transform('a=3Db', { options: { mode: 'decode' }, secondary: '' })).toBe('a=b');
  });

  it('exposes a mode select option with encode/decode choices', () => {
    const modeOpt = quotedPrintableLogic.options?.find((o) => o.key === 'mode');
    expect(modeOpt).toBeDefined();
    expect(modeOpt?.type).toBe('select');
    expect(modeOpt?.default).toBe('encode');
    expect(modeOpt?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
  });
});

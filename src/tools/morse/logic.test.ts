import { describe, it, expect } from 'vitest';
import { morseLogic } from './logic';

const enc = (input: string) =>
  morseLogic.transform(input, { options: { mode: 'encode' }, secondary: '' });
const dec = (input: string) =>
  morseLogic.transform(input, { options: { mode: 'decode' }, secondary: '' });

describe('morseLogic', () => {
  describe('options metadata', () => {
    it('exposes a single mode select option defaulting to encode', () => {
      expect(morseLogic.options).toBeDefined();
      const opt = morseLogic.options?.[0];
      expect(opt?.key).toBe('mode');
      expect(opt?.type).toBe('select');
      expect(opt?.default).toBe('encode');
      expect(opt?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
    });
  });

  describe('encode', () => {
    it('encodes SOS', () => {
      expect(enc('SOS')).toBe('... --- ...');
    });

    it('encodes AB', () => {
      expect(enc('AB')).toBe('.- -...');
    });

    it('separates words with " / "', () => {
      expect(enc('HI THERE')).toContain(' / ');
    });

    it('encodes a two-word phrase exactly', () => {
      // HI -> .... ..   THERE -> - .... . .-. .
      expect(enc('HI THERE')).toBe('.... .. / - .... . .-. .');
    });

    it('uppercases lowercase input', () => {
      expect(enc('sos')).toBe('... --- ...');
      expect(enc('hi')).toBe(enc('HI'));
    });

    it('encodes all digits', () => {
      expect(enc('0123456789')).toBe(
        '----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----.',
      );
    });

    it('drops unknown characters (punctuation) silently', () => {
      // The "," and "!" have no mapping and are filtered out.
      expect(enc('A,B!')).toBe('.- -...');
    });

    it('drops a word that consists only of unknown characters', () => {
      // "!!!" maps to nothing -> empty word filtered before the " / " join.
      expect(enc('A !!! B')).toBe('.- / -...');
    });

    it('collapses multiple/leading/trailing whitespace between words', () => {
      expect(enc('  A   B  ')).toBe('.- / -...');
    });

    it('handles tabs and newlines as word separators', () => {
      expect(enc('A\tB\nC')).toBe('.- / -... / -.-.');
    });

    it('returns empty string for empty input', () => {
      expect(enc('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(enc('   \t\n ')).toBe('');
    });

    it('returns empty string when input has only unknown characters', () => {
      // transform does not early-return (trim is non-empty), but encode yields ''.
      expect(enc('@#$%')).toBe('');
    });

    it('is deterministic', () => {
      expect(enc('HELLO WORLD')).toBe(enc('HELLO WORLD'));
    });

    it('encodes a large input without error', () => {
      const big = 'A'.repeat(5000);
      const out = enc(big);
      const tokens = out.split(' ');
      expect(tokens).toHaveLength(5000);
      expect(tokens.every((t) => t === '.-')).toBe(true);
    });

    it('ignores unicode/emoji characters', () => {
      expect(enc('Aé😀B')).toBe('.- -...');
    });
  });

  describe('decode', () => {
    it('decodes SOS', () => {
      expect(dec('... --- ...')).toBe('SOS');
    });

    it('decodes a two-word phrase with " / "', () => {
      expect(dec('.... .. / - .... . .-. .')).toBe('HI THERE');
    });

    it('trims surrounding whitespace before decoding', () => {
      expect(dec('   ... --- ...   ')).toBe('SOS');
    });

    it('tolerates extra spaces between tokens within a word', () => {
      // filter(token.length > 0) drops the empty tokens created by double spaces.
      expect(dec('...   ---   ...')).toBe('SOS');
    });

    it('decodes digits', () => {
      expect(dec('.---- ..--- ...--')).toBe('123');
    });

    it('returns empty string for empty input', () => {
      expect(dec('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(dec('    ')).toBe('');
    });

    it('throws on an invalid Morse token', () => {
      expect(() => dec('........')).toThrow(/Invalid Morse token/);
    });

    it('throws on a token mixed with valid ones', () => {
      expect(() => dec('... ----- ...... ...')).toThrow(/Invalid Morse token/);
    });
  });

  describe('round-trips', () => {
    it('round-trips HELLO', () => {
      expect(dec(enc('HELLO'))).toBe('HELLO');
    });

    it('round-trips a multi-word uppercase phrase', () => {
      expect(dec(enc('HELLO WORLD'))).toBe('HELLO WORLD');
    });

    it('round-trips digits', () => {
      expect(dec(enc('0123456789'))).toBe('0123456789');
    });

    it('round-trips lowercase input as uppercase', () => {
      expect(dec(enc('hello'))).toBe('HELLO');
    });
  });

  describe('mode defaulting', () => {
    it('defaults to encode when mode option is omitted', () => {
      const out = morseLogic.transform('SOS', { options: {}, secondary: '' });
      expect(out).toBe('... --- ...');
    });

    it('encodes for an unrecognized mode value (non-decode)', () => {
      const out = morseLogic.transform('SOS', {
        options: { mode: 'whatever' },
        secondary: '',
      });
      expect(out).toBe('... --- ...');
    });
  });
});

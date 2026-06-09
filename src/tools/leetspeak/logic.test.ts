import { describe, it, expect } from 'vitest';
import { leetspeakLogic } from './logic';

const encode = (input: string) =>
  leetspeakLogic.transform(input, { options: { mode: 'encode' }, secondary: '' });
const decode = (input: string) =>
  leetspeakLogic.transform(input, { options: { mode: 'decode' }, secondary: '' });

describe('leetspeakLogic', () => {
  describe('encode', () => {
    it('encodes leet to l337', () => {
      expect(encode('leet')).toBe('l337');
    });

    it('encodes test to 7357', () => {
      expect(encode('test')).toBe('7357');
    });

    it('encodes Hello preserving unmapped case', () => {
      expect(encode('Hello')).toBe('H3ll0');
    });

    it('maps every mapped lowercase letter (a e i o s t)', () => {
      expect(encode('aeiost')).toBe('431057');
    });

    it('maps uppercase mapped letters too (case-insensitive lookup)', () => {
      expect(encode('AEIOST')).toBe('431057');
    });

    it('leaves unmapped letters unchanged', () => {
      expect(encode('bcdfg')).toBe('bcdfg');
    });

    it('preserves unmapped uppercase letters as-is', () => {
      expect(encode('BCDFG')).toBe('BCDFG');
    });

    it('returns empty string for empty input', () => {
      expect(encode('')).toBe('');
    });

    it('preserves whitespace-only input', () => {
      expect(encode('   \t\n ')).toBe('   \t\n ');
    });

    it('leaves existing digits and punctuation unchanged', () => {
      expect(encode('a1!?o')).toBe('41!?0');
    });

    it('preserves emoji and non-latin unicode while mapping latin letters', () => {
      // '😀' and 'ü' are not in the map; only 'a' and 'o' map.
      expect(encode('a😀oü')).toBe('4😀0ü');
    });

    it('handles a longer mixed sentence', () => {
      // 'T' lowercases to 't' which maps to '7'.
      expect(encode('The quick brown fox')).toBe('7h3 qu1ck br0wn f0x');
    });

    it('is deterministic across repeated calls', () => {
      expect(encode('repeatable')).toBe(encode('repeatable'));
    });
  });

  describe('decode', () => {
    it('decodes l337 back to leet', () => {
      expect(decode('l337')).toBe('leet');
    });

    it('decodes every mapped digit (4 3 1 0 5 7)', () => {
      expect(decode('431057')).toBe('aeiost');
    });

    it('leaves unmapped digits unchanged', () => {
      expect(decode('2689')).toBe('2689');
    });

    it('returns empty string for empty input', () => {
      expect(decode('')).toBe('');
    });

    it('preserves whitespace and punctuation', () => {
      expect(decode('  4! 7?')).toBe('  a! t?');
    });

    it('leaves letters unchanged when decoding', () => {
      expect(decode('Hello')).toBe('Hello');
    });

    it('preserves emoji while decoding mapped digits', () => {
      expect(decode('4😀0')).toBe('a😀o');
    });

    it('is deterministic across repeated calls', () => {
      expect(decode('7357')).toBe(decode('7357'));
    });
  });

  describe('mode handling', () => {
    it('defaults to encode when no ctx provided', () => {
      expect(leetspeakLogic.transform('test')).toBe('7357');
    });

    it('defaults to encode when mode is absent in options', () => {
      expect(leetspeakLogic.transform('test', { options: {}, secondary: '' })).toBe('7357');
    });

    it('treats any non-decode mode value as encode', () => {
      expect(
        leetspeakLogic.transform('test', { options: { mode: 'something-else' }, secondary: '' }),
      ).toBe('7357');
    });

    it('exposes a single mode select option with encode/decode choices', () => {
      const modeOpt = leetspeakLogic.options?.find((o) => o.key === 'mode');
      expect(modeOpt?.type).toBe('select');
      expect(modeOpt?.default).toBe('encode');
      expect(modeOpt?.choices?.map((c) => c.value)).toEqual(['encode', 'decode']);
    });
  });

  describe('round-trips and properties', () => {
    it('round-trips lowercase mapped + unmapped chars (encode then decode)', () => {
      const original = 'leet test aeiost xyz';
      expect(decode(encode(original))).toBe(original);
    });

    it('round-trips decode then encode for leet-only digit text', () => {
      const leet = '431057';
      expect(encode(decode(leet))).toBe(leet);
    });

    it('encode lowercases mapped letters so uppercase round-trip is lossy (documented)', () => {
      // 'A' -> '4' -> 'a'; case is not recoverable. Assert the lossy behavior.
      expect(decode(encode('AEIOST'))).toBe('aeiost');
    });

    it('handles very large input without altering length-per-char mapping', () => {
      const big = 'aeiost'.repeat(5000);
      const out = encode(big);
      expect(out.length).toBe(big.length);
      expect(out.startsWith('431057')).toBe(true);
      expect(decode(out)).toBe(big);
    });
  });
});

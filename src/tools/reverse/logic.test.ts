import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { reverseLogic } from './logic';

const rev = (s: string, unit?: string) =>
  reverseLogic.transform(s, { options: unit === undefined ? {} : { unit }, secondary: '' } as ToolContext);

describe('reverse', () => {
  describe('option metadata', () => {
    it('exposes a single select option with three choices', () => {
      expect(reverseLogic.options).toHaveLength(1);
      const opt = reverseLogic.options![0];
      expect(opt.key).toBe('unit');
      expect(opt.type).toBe('select');
      expect(opt.default).toBe('characters');
      expect(opt.choices?.map((c) => c.value)).toEqual(['characters', 'words', 'lines']);
    });
  });

  describe('characters', () => {
    it('reverses a simple ascii string', () => {
      expect(rev('abc', 'characters')).toBe('cba');
    });
    it('reverses a single char to itself', () => {
      expect(rev('x', 'characters')).toBe('x');
    });
    it('handles emoji as single code points', () => {
      expect(rev('a😀b', 'characters')).toBe('b😀a');
    });
    it('preserves whitespace and special chars in reversed order', () => {
      expect(rev('a b\tc', 'characters')).toBe('c\tb a');
    });
    it('reverses numbers and symbols', () => {
      expect(rev('123!@#', 'characters')).toBe('#@!321');
    });
    it('is its own inverse (round-trip) for characters', () => {
      const s = 'Hello, 世界! 😀';
      expect(rev(rev(s, 'characters'), 'characters')).toBe(s);
    });
    it('handles a large input deterministically', () => {
      const big = 'a'.repeat(100000) + 'Z';
      const out = rev(big, 'characters');
      expect(out[0]).toBe('Z');
      expect(out.length).toBe(big.length);
      expect(out).toBe('Z' + 'a'.repeat(100000));
    });
  });

  describe('words', () => {
    it('reverses word order', () => {
      expect(rev('one two three', 'words')).toBe('three two one');
    });
    it('preserves the whitespace separators between words', () => {
      expect(rev('one  two', 'words')).toBe('two  one');
    });
    it('preserves mixed whitespace runs (tabs/newlines)', () => {
      // split keeps each whitespace run as its own token; reversing tokens swaps word order
      expect(rev('a\tb', 'words')).toBe('b\ta');
    });
    it('moves leading whitespace to the trailing position', () => {
      // '  hello' -> ['', '  ', 'hello'] -> reversed join -> 'hello  '
      expect(rev('  hello', 'words')).toBe('hello  ');
    });
    it('moves trailing whitespace to the leading position', () => {
      // 'hello  ' -> ['hello', '  ', ''] -> reversed join -> '  hello'
      expect(rev('hello  ', 'words')).toBe('  hello');
    });
    it('returns single word unchanged', () => {
      expect(rev('word', 'words')).toBe('word');
    });
    it('handles three words with single spaces', () => {
      expect(rev('alpha beta gamma', 'words')).toBe('gamma beta alpha');
    });
    it('double word reversal restores original spacing', () => {
      const s = 'a b c';
      expect(rev(rev(s, 'words'), 'words')).toBe(s);
    });
  });

  describe('lines', () => {
    it('reverses line order', () => {
      expect(rev('a\nb\nc', 'lines')).toBe('c\nb\na');
    });
    it('returns single line unchanged', () => {
      expect(rev('only', 'lines')).toBe('only');
    });
    it('preserves trailing empty line as leading empty line', () => {
      // 'a\nb\n' -> ['a','b',''] -> reversed -> ['','b','a'] -> '\nb\na'
      expect(rev('a\nb\n', 'lines')).toBe('\nb\na');
    });
    it('preserves leading empty line as trailing empty line', () => {
      expect(rev('\na\nb', 'lines')).toBe('b\na\n');
    });
    it('does not split on carriage returns (only \\n)', () => {
      // only \n splits; the \r stays attached to its line ('a\r','b') -> reversed
      expect(rev('a\r\nb', 'lines')).toBe('b\na\r');
    });
    it('double line reversal restores original', () => {
      const s = 'one\ntwo\nthree';
      expect(rev(rev(s, 'lines'), 'lines')).toBe(s);
    });
    it('keeps content within each line intact', () => {
      expect(rev('hello world\nfoo bar', 'lines')).toBe('foo bar\nhello world');
    });
  });

  describe('default / unknown unit', () => {
    it('falls back to characters when no unit provided', () => {
      expect(rev('abc')).toBe('cba');
    });
    it('falls back to characters for an unknown unit value', () => {
      expect(rev('abc', 'sentences')).toBe('cba');
    });
    it('treats undefined options object as characters', () => {
      expect(reverseLogic.transform('xyz')).toBe('zyx');
    });
  });

  describe('edge cases across units', () => {
    it('empty string returns empty for characters', () => {
      expect(rev('', 'characters')).toBe('');
    });
    it('empty string returns empty for words', () => {
      // ''.split(/(\s+)/) -> [''] -> reversed -> ''
      expect(rev('', 'words')).toBe('');
    });
    it('empty string returns empty for lines', () => {
      expect(rev('', 'lines')).toBe('');
    });
    it('whitespace-only string for characters reverses identically (palindrome of spaces)', () => {
      expect(rev('   ', 'characters')).toBe('   ');
    });
    it('whitespace-only string for words stays whitespace', () => {
      // '   '.split(/(\s+)/) -> ['', '   ', ''] -> reversed join -> '   '
      expect(rev('   ', 'words')).toBe('   ');
    });
    it('does not throw on any unit for arbitrary input', () => {
      expect(() => rev('any\ninput here', 'lines')).not.toThrow();
      expect(() => rev('any\ninput here', 'words')).not.toThrow();
      expect(() => rev('any\ninput here', 'characters')).not.toThrow();
    });
  });
});

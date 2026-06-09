import { describe, it, expect } from 'vitest';
import { findReplaceLogic } from './logic';

const run = (input: string, options: Record<string, string | boolean>) =>
  findReplaceLogic.transform(input, { options, secondary: '' });

describe('findReplace', () => {
  describe('literal (default) mode', () => {
    it('replaces all literal occurrences', () => {
      expect(run('cat cat dog', { find: 'cat', replace: 'fish' })).toBe('fish fish dog');
    });

    it('replaces overlapping-adjacent occurrences via split/join', () => {
      expect(run('aaa', { find: 'a', replace: 'b' })).toBe('bbb');
    });

    it('removes occurrences when replace is empty', () => {
      expect(run('a-b-c', { find: '-', replace: '' })).toBe('abc');
    });

    it('treats regex-special chars as literals (no escaping needed in split mode)', () => {
      expect(run('a.b.c', { find: '.', replace: '_' })).toBe('a_b_c');
      expect(run('a(b)c', { find: '(', replace: '[' })).toBe('a[b)c');
      expect(run('1+2+3', { find: '+', replace: '-' })).toBe('1-2-3');
    });

    it('is case-sensitive by default', () => {
      expect(run('Cat cat CAT', { find: 'cat', replace: 'x' })).toBe('Cat x CAT');
    });

    it('handles leading and trailing matches', () => {
      expect(run('xxmiddlexx', { find: 'xx', replace: 'Y' })).toBe('YmiddleY');
    });

    it('does nothing when the term is absent', () => {
      expect(run('hello world', { find: 'zzz', replace: 'x' })).toBe('hello world');
    });

    it('replaces multi-character substrings', () => {
      expect(run('foobarfoo', { find: 'foo', replace: 'BAZ' })).toBe('BAZbarBAZ');
    });
  });

  describe('case-insensitive literal mode', () => {
    it('supports case-insensitive literal replace', () => {
      expect(run('Cat cat', { find: 'cat', replace: 'x', ci: true })).toBe('x x');
    });

    it('matches mixed casing for all occurrences', () => {
      expect(run('Cat cat CAT cAt', { find: 'cat', replace: 'x', ci: true })).toBe('x x x x');
    });

    it('escapes regex-special chars so they match literally', () => {
      expect(run('a.b.c', { find: '.', replace: '_', ci: true })).toBe('a_b_c');
    });

    it('escapes parentheses and other metacharacters literally', () => {
      expect(run('f(x) F(X)', { find: '(x)', replace: '[]', ci: true })).toBe('f[] F[]');
    });

    it('escapes a backslash literally', () => {
      expect(run('a\\b\\c', { find: '\\', replace: '/', ci: true })).toBe('a/b/c');
    });

    it('handles a dollar-sign find literally', () => {
      expect(run('$5 and $10', { find: '$', replace: 'USD', ci: true })).toBe('USD5 and USD10');
    });
  });

  describe('regex mode', () => {
    it('supports regex replacement', () => {
      expect(run('a1b2c3', { find: '\\d', replace: '#', regex: true })).toBe('a#b#c#');
    });

    it('applies the global flag (replaces every match)', () => {
      expect(run('aaa', { find: 'a', replace: 'b', regex: true })).toBe('bbb');
    });

    it('supports capture-group backreferences in replacement', () => {
      expect(run('John Smith', { find: '(\\w+) (\\w+)', replace: '$2 $1', regex: true })).toBe(
        'Smith John',
      );
    });

    it('supports anchors and character classes', () => {
      expect(run('hello\nworld', { find: '^', replace: '> ', regex: true })).toBe('> hello\nworld');
    });

    it('combines regex with case-insensitive flag', () => {
      expect(run('Hello HELLO hello', { find: 'hello', replace: 'x', regex: true, ci: true })).toBe(
        'x x x',
      );
    });

    it('is case-sensitive in regex mode when ci is off', () => {
      expect(run('Hello hello', { find: 'hello', replace: 'x', regex: true })).toBe('Hello x');
    });

    it('matches whitespace via \\s', () => {
      expect(run('a b\tc', { find: '\\s', replace: '_', regex: true })).toBe('a_b_c');
    });

    it('replaces empty-string matches between every char (.* style)', () => {
      // \b? would be odd; use an empty alternation match: 'x*' matches empty everywhere
      expect(run('ab', { find: 'x*', replace: '-', regex: true })).toBe('-a-b-');
    });
  });

  describe('empty / no-op handling', () => {
    it('returns input unchanged when find is empty', () => {
      expect(run('hello', { find: '', replace: 'x' })).toBe('hello');
    });

    it('returns input unchanged when find is missing entirely', () => {
      expect(run('hello', { replace: 'x' })).toBe('hello');
    });

    it('returns empty string input unchanged when find is empty', () => {
      expect(run('', { find: '', replace: 'x' })).toBe('');
    });

    it('returns empty input when find term is not found in empty string', () => {
      expect(run('', { find: 'a', replace: 'b' })).toBe('');
    });

    it('treats missing replace as empty string (removal)', () => {
      expect(run('a-b-c', { find: '-' })).toBe('abc');
    });
  });

  describe('unicode and emoji', () => {
    it('replaces emoji literally', () => {
      expect(run('hi 😀 there 😀', { find: '😀', replace: '🎉' })).toBe('hi 🎉 there 🎉');
    });

    it('replaces accented/unicode text', () => {
      expect(run('café CAFÉ', { find: 'café', replace: 'bar', ci: true })).toBe('bar bar');
    });
  });

  describe('large input and determinism', () => {
    it('handles very large input', () => {
      const big = 'ab'.repeat(50000);
      const out = run(big, { find: 'a', replace: 'X' });
      expect(out).toBe('Xb'.repeat(50000));
      expect(out.length).toBe(big.length);
    });

    it('is deterministic across repeated calls', () => {
      const opts = { find: 'x', replace: 'y', regex: true };
      const a = run('xxx yyy xxx', opts);
      const b = run('xxx yyy xxx', opts);
      expect(a).toBe(b);
      expect(a).toBe('yyy yyy yyy');
    });
  });

  describe('error paths', () => {
    it('throws on invalid regex', () => {
      expect(() => run('x', { find: '(', replace: '', regex: true })).toThrow();
    });

    it('throws with an "Invalid regex" message on malformed pattern', () => {
      expect(() => run('x', { find: '[', replace: '', regex: true })).toThrow(/Invalid regex/);
    });

    it('does NOT throw on the same malformed pattern in literal mode', () => {
      expect(() => run('a(b', { find: '(', replace: ')' })).not.toThrow();
      expect(run('a(b', { find: '(', replace: ')' })).toBe('a)b');
    });
  });
});

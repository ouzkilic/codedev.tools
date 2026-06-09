import { describe, it, expect } from 'vitest';
import { regexTesterLogic } from './logic';

const run = (text: string, pattern: string, flags = 'g') =>
  regexTesterLogic.transform(text, { options: { pattern, flags }, secondary: '' });

describe('regexTester', () => {
  it('finds all matches', () => {
    const out = run('a1b22c333', '\\d+');
    expect(out).toContain('Match 1: "1"');
    expect(out).toContain('Match 2: "22"');
    expect(out).toContain('Match 3: "333"');
  });

  it('reports the index of each match', () => {
    const out = run('a1b22c333', '\\d+');
    expect(out).toContain('Match 1: "1" at index 1');
    expect(out).toContain('Match 2: "22" at index 3');
    expect(out).toContain('Match 3: "333" at index 6');
  });

  it('reports capture groups', () => {
    const out = run('2024-11', '(\\d{4})-(\\d{2})');
    expect(out).toContain('group 1: "2024"');
    expect(out).toContain('group 2: "11"');
  });

  it('reports no matches', () => {
    expect(run('abc', '\\d+')).toBe('No matches.');
  });

  it('throws on an invalid pattern', () => {
    expect(() => run('x', '(')).toThrow(/invalid regex/i);
  });

  it('returns a prompt when the pattern is empty', () => {
    expect(run('anything', '')).toBe('Enter a pattern in the toolbar.');
  });

  it('treats empty pattern as empty regardless of input', () => {
    expect(run('', '')).toBe('Enter a pattern in the toolbar.');
    expect(run('123', '', 'gim')).toBe('Enter a pattern in the toolbar.');
  });

  it('finds a single match', () => {
    const out = run('hello world', 'world');
    expect(out).toBe('Match 1: "world" at index 6');
  });

  it('appends the global flag when missing so all matches are found', () => {
    // flags='' -> code appends 'g'; without g, matchAll would only ever see one.
    const out = run('aXaXa', 'a', '');
    expect(out).toContain('Match 1: "a" at index 0');
    expect(out).toContain('Match 2: "a" at index 2');
    expect(out).toContain('Match 3: "a" at index 4');
  });

  it('does not duplicate the global flag when already present', () => {
    // 'g' already there; should still work and find all matches.
    const out = run('a.a.a', 'a', 'g');
    expect(out).toContain('Match 1: "a" at index 0');
    expect(out).toContain('Match 3: "a" at index 4');
  });

  it('honors the case-insensitive flag', () => {
    const sensitive = run('AbcABC', 'abc');
    expect(sensitive).toBe('No matches.');
    const insensitive = run('AbcABC', 'abc', 'gi');
    expect(insensitive).toContain('Match 1: "Abc" at index 0');
    expect(insensitive).toContain('Match 2: "ABC" at index 3');
  });

  it('honors the multiline flag for anchors', () => {
    const text = 'a\nb\nc';
    const single = run(text, '^.', 'g');
    expect(single).toBe('Match 1: "a" at index 0');
    const multi = run(text, '^.', 'gm');
    expect(multi).toContain('Match 1: "a" at index 0');
    expect(multi).toContain('Match 2: "b" at index 2');
    expect(multi).toContain('Match 3: "c" at index 4');
  });

  it('honors the dotAll (s) flag', () => {
    const noDotAll = run('a\nb', 'a.b', 'g');
    expect(noDotAll).toBe('No matches.');
    const dotAll = run('a\nb', 'a.b', 'gs');
    expect(dotAll).toBe('Match 1: "a\nb" at index 0');
  });

  it('reports an undefined optional capture group', () => {
    const out = run('ac', 'a(b)?c');
    expect(out).toContain('group 1: (undefined)');
    expect(out).not.toContain('group 1: "undefined"');
  });

  it('reports an empty-string capture group as quoted empty', () => {
    const out = run('ac', 'a(b*)c');
    expect(out).toContain('Match 1: "ac" at index 0');
    expect(out).toContain('group 1: ""');
  });

  it('numbers multiple groups sequentially', () => {
    const out = run('abc', '(a)(b)(c)');
    expect(out).toContain('group 1: "a"');
    expect(out).toContain('group 2: "b"');
    expect(out).toContain('group 3: "c"');
  });

  it('handles unicode and emoji input', () => {
    const out = run('café 🎉 café', 'café');
    expect(out).toContain('Match 1: "café" at index 0');
    expect(out).toContain('Match 2: "café"');
  });

  it('matches emoji with the unicode flag', () => {
    const out = run('a🎉b', '\\p{Emoji}', 'gu');
    expect(out).toContain('Match 1: "🎉"');
  });

  it('throws on an invalid unicode escape under the u flag', () => {
    expect(() => run('x', '\\p{Bogus}', 'gu')).toThrow(/invalid regex/i);
  });

  it('returns no matches for whitespace-only input against a digit pattern', () => {
    expect(run('   \t\n  ', '\\d')).toBe('No matches.');
  });

  it('matches whitespace explicitly', () => {
    const out = run('a b c', '\\s');
    expect(out).toContain('Match 1: " " at index 1');
    expect(out).toContain('Match 2: " " at index 3');
  });

  it('handles a large input efficiently', () => {
    const input = 'x'.repeat(10000) + '42';
    const out = run(input, '\\d+');
    expect(out).toBe('Match 1: "42" at index 10000');
  });

  it('matches an empty-width pattern producing multiple zero-length matches', () => {
    // 'a*' on 'bb' matches empty string at each boundary; ensure no crash, returns matches.
    const out = run('bb', 'a*');
    expect(out).toContain('Match 1: "" at index 0');
  });

  it('escapes special characters when matched literally', () => {
    const out = run('1+1=2', '\\+');
    expect(out).toBe('Match 1: "+" at index 1');
  });

  it('matches leading and trailing separators', () => {
    const out = run(',a,b,', ',');
    expect(out).toContain('Match 1: "," at index 0');
    expect(out).toContain('Match 3: "," at index 4');
  });

  it('is deterministic across repeated calls', () => {
    const a = run('a1b2c3', '\\d');
    const b = run('a1b2c3', '\\d');
    expect(a).toBe(b);
  });

  it('defaults flags to g when omitted in the helper', () => {
    const out = run('aaa', 'a');
    expect(out).toContain('Match 1: "a" at index 0');
    expect(out).toContain('Match 3: "a" at index 2');
  });

  it('treats a nullish options object defensively', () => {
    // ctx undefined -> pattern resolves to '' -> prompt message
    expect(regexTesterLogic.transform('text')).toBe('Enter a pattern in the toolbar.');
  });
});

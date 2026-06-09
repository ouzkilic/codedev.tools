import { describe, it, expect } from 'vitest';
import { textCaseLogic } from './logic';

const to = (target: string) => (s: string) =>
  textCaseLogic.transform(s, { options: { target }, secondary: '' });

describe('textCase', () => {
  it('converts to camelCase', () => {
    expect(to('camel')('hello world')).toBe('helloWorld');
  });
  it('converts to PascalCase', () => {
    expect(to('pascal')('hello world')).toBe('HelloWorld');
  });
  it('converts to snake_case', () => {
    expect(to('snake')('Hello World')).toBe('hello_world');
  });
  it('converts to kebab-case', () => {
    expect(to('kebab')('Hello World')).toBe('hello-world');
  });
  it('converts to CONSTANT_CASE', () => {
    expect(to('constant')('hello world')).toBe('HELLO_WORLD');
  });
  it('splits an existing camelCase identifier', () => {
    expect(to('snake')('helloWorldFoo')).toBe('hello_world_foo');
  });
  it('title-cases a sentence', () => {
    expect(to('title')('the quick brown fox')).toBe('The Quick Brown Fox');
  });

  // --- Sentence case ---
  it('sentence-cases: capitalizes only the first word, lowercases the rest', () => {
    expect(to('sentence')('hello WORLD foo')).toBe('Hello world foo');
  });
  it('sentence-cases a single word', () => {
    expect(to('sentence')('HELLO')).toBe('Hello');
  });

  // --- lower / upper operate on raw input (not word-split) ---
  it('lowercases the entire raw input, preserving separators', () => {
    expect(to('lower')('Hello_World-Foo')).toBe('hello_world-foo');
  });
  it('uppercases the entire raw input, preserving separators', () => {
    expect(to('upper')('Hello_World-Foo')).toBe('HELLO_WORLD-FOO');
  });

  // --- separator normalization ---
  it('treats snake_case, kebab-case and spaces uniformly when splitting words', () => {
    expect(to('camel')('foo_bar-baz qux')).toBe('fooBarBazQux');
  });
  it('collapses multiple/mixed separators', () => {
    expect(to('kebab')('foo___bar---baz   qux')).toBe('foo-bar-baz-qux');
  });
  it('trims leading and trailing separators/whitespace', () => {
    expect(to('snake')('  __hello world--  ')).toBe('hello_world');
  });

  // --- camelCase boundary: digit followed by uppercase splits ---
  it('splits on a digit-to-uppercase boundary', () => {
    expect(to('snake')('foo2Bar')).toBe('foo2_bar');
  });
  it('does not split a run of consecutive uppercase letters', () => {
    // ([a-z0-9])([A-Z]) only splits lower/digit -> upper, so JSONParser stays one word
    expect(to('snake')('JSONParser')).toBe('jsonparser');
    expect(to('title')('JSONParser')).toBe('Jsonparser');
  });

  // --- cap lowercases the tail of each word ---
  it('pascal-cases by lowercasing the tail of each detected word', () => {
    // words() splits 'fOO' -> ['f','OO'] and 'bAR' -> ['b','AR'] on the lower->upper boundary
    expect(to('pascal')('fOO bAR')).toBe('FOoBAr');
  });
  it('pascal-cases an all-lowercase phrase cleanly', () => {
    expect(to('pascal')('foo bar')).toBe('FooBar');
  });

  // --- edge cases ---
  it('returns empty string for empty input across word-based converters', () => {
    expect(to('camel')('')).toBe('');
    expect(to('pascal')('')).toBe('');
    expect(to('snake')('')).toBe('');
    expect(to('title')('')).toBe('');
  });
  it('returns empty string for whitespace/separator-only input (word-based)', () => {
    expect(to('snake')('   ')).toBe('');
    expect(to('kebab')('___---')).toBe('');
    expect(to('camel')('   ')).toBe('');
  });
  it('lower/upper return empty string for empty input', () => {
    expect(to('lower')('')).toBe('');
    expect(to('upper')('')).toBe('');
  });

  // --- single word ---
  it('handles a single lowercase word', () => {
    expect(to('camel')('hello')).toBe('hello');
    expect(to('pascal')('hello')).toBe('Hello');
    expect(to('constant')('hello')).toBe('HELLO');
  });

  // --- unicode / emoji (no A-Z/a-z boundary handling, passes through) ---
  it('keeps unicode words intact and applies separators', () => {
    expect(to('snake')('café déjà')).toBe('café_déjà');
  });
  it('passes emoji through as a word', () => {
    expect(to('snake')('hello 🚀 world')).toBe('hello_🚀_world');
    expect(to('upper')('🚀 hi')).toBe('🚀 HI');
  });

  // --- option fallback behavior ---
  it('falls back to camel when target is unknown', () => {
    expect(textCaseLogic.transform('hello world', { options: { target: 'bogus' }, secondary: '' })).toBe(
      'helloWorld',
    );
  });
  it('defaults to camel when target option is missing', () => {
    expect(textCaseLogic.transform('hello world', { options: {}, secondary: '' })).toBe('helloWorld');
  });

  // --- declared option choices match the implemented converters ---
  it('implements a converter for every declared select choice', () => {
    const targetOption = textCaseLogic.options?.find((o) => o.key === 'target');
    expect(targetOption).toBeDefined();
    const values = (targetOption?.choices ?? []).map((c) => c.value);
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) {
      // each choice should produce a deterministic, defined result
      expect(typeof to(v)('Hello World')).toBe('string');
    }
    // the default option value should be a real choice
    expect(values).toContain(String(targetOption?.default));
  });

  // --- large input does not throw and stays well-formed ---
  it('handles large input without throwing', () => {
    // "wordN" has no lower/digit->upper boundary, so each token is a single word
    const big = Array.from({ length: 2000 }, (_, i) => `word${i}`).join(' ');
    const result = to('snake')(big);
    expect(result.split('_').length).toBe(2000);
    expect(result.startsWith('word0_word1_')).toBe(true);
  });

  // --- idempotency / round-trip properties ---
  it('snake_case is idempotent', () => {
    const once = to('snake')('Hello World Foo');
    expect(to('snake')(once)).toBe(once);
  });
  it('lowercase is idempotent', () => {
    const once = to('lower')('Hello_World');
    expect(to('lower')(once)).toBe(once);
  });
  it('round-trips snake -> camel for simple identifiers', () => {
    expect(to('camel')(to('snake')('helloWorldFoo'))).toBe('helloWorldFoo');
  });
});

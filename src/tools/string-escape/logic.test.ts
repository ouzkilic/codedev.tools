import { describe, it, expect } from 'vitest';
import { stringEscapeLogic } from './logic';

const esc = (s: string) => stringEscapeLogic.transform(s, { options: { mode: 'escape' }, secondary: '' });
const unesc = (s: string) => stringEscapeLogic.transform(s, { options: { mode: 'unescape' }, secondary: '' });

describe('stringEscape — escape mode', () => {
  it('escapes newlines and tabs', () => {
    expect(esc('a\nb\tc')).toBe('a\\nb\\tc');
  });

  it('escapes backslashes', () => {
    expect(esc('a\\b')).toBe('a\\\\b');
  });

  it('escapes carriage returns', () => {
    expect(esc('a\rb')).toBe('a\\rb');
  });

  it('escapes CRLF sequences as two separate escapes', () => {
    expect(esc('a\r\nb')).toBe('a\\r\\nb');
  });

  it('escapes a lone backslash to a double backslash', () => {
    expect(esc('\\')).toBe('\\\\');
  });

  it('escapes backslash before newline preserving order (backslash first)', () => {
    // '\\\n' is backslash + newline -> '\\\\' + '\\n'
    expect(esc('\\\n')).toBe('\\\\\\n');
  });

  it('does NOT escape double or single quotes', () => {
    expect(esc('"hello"')).toBe('"hello"');
    expect(esc("'x'")).toBe("'x'");
  });

  it('returns empty string for empty input', () => {
    expect(esc('')).toBe('');
  });

  it('leaves plain text without special chars unchanged', () => {
    expect(esc('hello world 123')).toBe('hello world 123');
  });

  it('preserves unicode and emoji untouched', () => {
    expect(esc('café 🚀 ünïcödé')).toBe('café 🚀 ünïcödé');
  });

  it('escapes only the recognized control chars, leaving form-feed/vertical-tab alone', () => {
    // \f (\x0c) and \v (\x0b) are not in the escape set
    expect(esc('a\fb\vc')).toBe('a\fb\vc');
  });

  it('handles leading and trailing whitespace control chars', () => {
    expect(esc('\n\tmid\t\n')).toBe('\\n\\tmid\\t\\n');
  });

  it('escapes a whitespace-only newline string', () => {
    expect(esc('\n\n\n')).toBe('\\n\\n\\n');
  });

  it('handles very large input deterministically', () => {
    const raw = 'x\n'.repeat(10000);
    const out = esc(raw);
    expect(out).toBe('x\\n'.repeat(10000));
    expect(out.length).toBe(raw.length + 10000); // each \n (1 char) becomes \\n (2 chars)
  });

  it('defaults to escape mode when no ctx is provided', () => {
    expect(stringEscapeLogic.transform('a\nb')).toBe('a\\nb');
  });

  it('defaults to escape mode when mode option is missing', () => {
    expect(stringEscapeLogic.transform('a\tb', { options: {}, secondary: '' })).toBe('a\\tb');
  });

  it('defaults to escape mode for an unknown mode value', () => {
    expect(stringEscapeLogic.transform('a\nb', { options: { mode: 'bogus' }, secondary: '' })).toBe('a\\nb');
  });
});

describe('stringEscape — unescape mode', () => {
  it('unescapes sequences back to characters', () => {
    expect(unesc('a\\nb\\tc')).toBe('a\nb\tc');
  });

  it('unescapes carriage returns', () => {
    expect(unesc('a\\rb')).toBe('a\rb');
  });

  it('unescapes a double backslash to a single backslash', () => {
    expect(unesc('\\\\')).toBe('\\');
  });

  it('unescapes escaped double and single quotes', () => {
    expect(unesc('\\"')).toBe('"');
    expect(unesc("\\'")).toBe("'");
  });

  it('returns empty string for empty input', () => {
    expect(unesc('')).toBe('');
  });

  it('leaves a trailing lone backslash (no following escapable char) unchanged', () => {
    // single backslash at end: regex requires a following char from the set
    expect(unesc('abc\\')).toBe('abc\\');
  });

  it('leaves unknown escape sequences untouched', () => {
    // \x is not in the set, so it stays as-is
    expect(unesc('a\\xb')).toBe('a\\xb');
  });

  it('consumes backslash greedily left-to-right: "\\\\n" -> backslash + n', () => {
    // input chars: backslash, backslash, n. First two match \\ -> \, leaving n.
    expect(unesc('\\\\n')).toBe('\\n');
  });

  it('handles three backslashes then n: "\\\\\\n" -> backslash + newline', () => {
    // chars: \ \ \ n -> first \\ -> \, then \n -> newline
    expect(unesc('\\\\\\n')).toBe('\\\n');
  });

  it('handles unicode/emoji passthrough', () => {
    expect(unesc('🚀 plain text')).toBe('🚀 plain text');
  });

  it('processes a large input deterministically', () => {
    const raw = 'x\\n'.repeat(5000);
    expect(unesc(raw)).toBe('x\n'.repeat(5000));
  });
});

describe('stringEscape — round-trips & properties', () => {
  it('round-trips text with newlines, tabs and backslashes', () => {
    const raw = 'line1\nline2\twith \\ backslash';
    expect(unesc(esc(raw))).toBe(raw);
  });

  it('round-trips carriage returns', () => {
    const raw = 'a\r\nb';
    expect(unesc(esc(raw))).toBe(raw);
  });

  it('round-trips an empty string', () => {
    expect(unesc(esc(''))).toBe('');
  });

  it('round-trips a string of only backslashes', () => {
    const raw = '\\\\\\';
    expect(unesc(esc(raw))).toBe(raw);
  });

  it('round-trips unicode/emoji content', () => {
    const raw = 'café 🚀\nünïcödé\t\\done';
    expect(unesc(esc(raw))).toBe(raw);
  });

  it('escape is idempotent only when no special chars are present', () => {
    const plain = 'hello world';
    expect(esc(esc(plain))).toBe(plain);
  });

  it('escape is deterministic across repeated calls', () => {
    const raw = 'a\nb\t\\c\r';
    expect(esc(raw)).toBe(esc(raw));
  });
});

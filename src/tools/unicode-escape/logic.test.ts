import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { unicodeEscapeLogic } from './logic';

const ctx = (mode: string): ToolContext => ({ options: { mode }, secondary: '' });
const esc = (s: string) => unicodeEscapeLogic.transform(s, ctx('escape'));
const unesc = (s: string) => unicodeEscapeLogic.transform(s, ctx('unescape'));

describe('unicodeEscape - escape mode', () => {
  it('escapes non-ASCII characters', () => {
    expect(esc('café')).toBe('caf\\u00e9');
  });

  it('leaves ASCII untouched', () => {
    expect(esc('hello')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(esc('')).toBe('');
  });

  it('leaves plain ASCII whitespace and control chars (< U+0080) untouched', () => {
    // tab, newline, DEL (0x7f) are all below the U+0080 boundary
    expect(esc('\t\n\x7f')).toBe('\t\n\x7f');
  });

  it('escapes the boundary character U+0080', () => {
    expect(esc('')).toBe('\\u0080');
  });

  it('uses lowercase hex padded to four digits', () => {
    expect(esc('€')).toBe('\\u20ac');
    expect(esc('中')).toBe('\\u4e2d');
  });

  it('emits surrogate pairs for characters outside the BMP (emoji)', () => {
    expect(esc('😀')).toBe('\\ud83d\\ude00');
  });

  it('escapes only the non-ASCII parts of a mixed string', () => {
    expect(esc('a€b中c')).toBe('a\\u20acb\\u4e2dc');
  });

  it('handles large input without altering ASCII content', () => {
    const big = 'x'.repeat(50000);
    expect(esc(big)).toBe(big);
  });
});

describe('unicodeEscape - unescape mode', () => {
  it('unescapes \\uXXXX sequences', () => {
    expect(unesc('caf\\u00e9')).toBe('café');
  });

  it('unescapes \\u{...} code points', () => {
    expect(unesc('\\u{1f600}')).toBe('😀');
  });

  it('accepts both uppercase and lowercase hex digits', () => {
    expect(unesc('\\u00E9')).toBe('é');
    expect(unesc('\\u00e9')).toBe('é');
  });

  it('reassembles surrogate pairs into a single emoji', () => {
    expect(unesc('\\ud83d\\ude00')).toBe('😀');
  });

  it('leaves text without escape sequences unchanged', () => {
    expect(unesc('plain text')).toBe('plain text');
  });

  it('returns empty string for empty input', () => {
    expect(unesc('')).toBe('');
  });

  it('handles mixed \\u{...} and \\uXXXX forms in one pass', () => {
    expect(unesc('\\u{1f600}-\\u00e9')).toBe('😀-é');
  });
});

describe('unicodeEscape - transform contract', () => {
  it('defaults to escape mode when no options/context provided', () => {
    expect(unicodeEscapeLogic.transform('café', undefined)).toBe('caf\\u00e9');
  });

  it('defaults to escape mode when mode is missing from options', () => {
    expect(unicodeEscapeLogic.transform('café', { options: {}, secondary: '' })).toBe('caf\\u00e9');
  });

  it('exposes a single mode select option with escape and unescape choices', () => {
    const modeOpt = unicodeEscapeLogic.options?.find((o) => o.key === 'mode');
    expect(modeOpt?.type).toBe('select');
    expect(modeOpt?.default).toBe('escape');
    expect(modeOpt?.choices?.map((c) => c.value)).toEqual(['escape', 'unescape']);
  });

  it('round-trips non-ASCII text through escape then unescape', () => {
    const original = 'café — 中文 😀 €';
    expect(unesc(esc(original))).toBe(original);
  });

  it('is idempotent under escape for pure-ASCII input', () => {
    const ascii = 'just-ascii_123';
    expect(esc(esc(ascii))).toBe(ascii);
  });
});

import { describe, it, expect } from 'vitest';
import { jsonEscapeLogic } from './logic';

const escape = (s: string) => jsonEscapeLogic.transform(s, { options: { mode: 'escape' }, secondary: '' });
const unescape = (s: string) => jsonEscapeLogic.transform(s, { options: { mode: 'unescape' }, secondary: '' });

describe('jsonEscape', () => {
  it('escapes quotes into a JSON string literal', () => {
    expect(escape('hello "world"')).toBe('"hello \\"world\\""');
  });
  it('escapes newlines and tabs', () => {
    expect(escape('a\nb\tc')).toBe('"a\\nb\\tc"');
  });
  it('unescapes a JSON string literal back to raw text', () => {
    expect(unescape('"a\\nb"')).toBe('a\nb');
  });
  it('round-trips escape → unescape', () => {
    const raw = 'line1\n"quoted"\tend';
    expect(unescape(escape(raw))).toBe(raw);
  });
  it('throws on unescape when input is not a string literal', () => {
    expect(() => unescape('{"a":1}')).toThrow();
  });
  it('defaults to escape mode when no option is given', () => {
    expect(jsonEscapeLogic.transform('x"y')).toBe('"x\\"y"');
  });
});

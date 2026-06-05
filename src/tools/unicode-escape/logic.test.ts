import { describe, it, expect } from 'vitest';
import { unicodeEscapeLogic } from './logic';

const esc = (s: string) => unicodeEscapeLogic.transform(s, { options: { mode: 'escape' }, secondary: '' });
const unesc = (s: string) => unicodeEscapeLogic.transform(s, { options: { mode: 'unescape' }, secondary: '' });

describe('unicodeEscape', () => {
  it('escapes non-ASCII characters', () => {
    expect(esc('café')).toBe('caf\\u00e9');
  });
  it('leaves ASCII untouched', () => {
    expect(esc('hello')).toBe('hello');
  });
  it('unescapes \\uXXXX sequences', () => {
    expect(unesc('caf\\u00e9')).toBe('café');
  });
  it('unescapes \\u{...} code points', () => {
    expect(unesc('\\u{1f600}')).toBe('😀');
  });
});

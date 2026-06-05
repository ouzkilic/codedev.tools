import { describe, it, expect } from 'vitest';
import { stringEscapeLogic } from './logic';

const esc = (s: string) => stringEscapeLogic.transform(s, { options: { mode: 'escape' }, secondary: '' });
const unesc = (s: string) => stringEscapeLogic.transform(s, { options: { mode: 'unescape' }, secondary: '' });

describe('stringEscape', () => {
  it('escapes newlines and tabs', () => {
    expect(esc('a\nb\tc')).toBe('a\\nb\\tc');
  });
  it('escapes backslashes', () => {
    expect(esc('a\\b')).toBe('a\\\\b');
  });
  it('unescapes sequences back to characters', () => {
    expect(unesc('a\\nb\\tc')).toBe('a\nb\tc');
  });
  it('round-trips', () => {
    const raw = 'line1\nline2\twith \\ backslash';
    expect(unesc(esc(raw))).toBe(raw);
  });
});

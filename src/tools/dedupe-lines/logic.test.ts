import { describe, it, expect } from 'vitest';
import { dedupeLinesLogic } from './logic';

const dedupe = (s: string, options: Record<string, string | boolean> = {}) =>
  dedupeLinesLogic.transform(s, { options, secondary: '' });

describe('dedupeLines', () => {
  it('removes duplicates, keeping first occurrence order', () => {
    expect(dedupe('a\nb\na\nc\nb')).toBe('a\nb\nc');
  });
  it('treats case-sensitively by default', () => {
    expect(dedupe('A\na')).toBe('A\na');
  });
  it('merges case variants when case-insensitive', () => {
    expect(dedupe('A\na\nB', { ci: true })).toBe('A\nB');
  });
  it('trims before comparing when enabled', () => {
    expect(dedupe('a\n a ', { trim: true })).toBe('a');
  });
});

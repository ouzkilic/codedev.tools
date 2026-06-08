import { describe, it, expect } from 'vitest';
import { buildEmoji } from './logic';

describe('buildEmoji', () => {
  it('returns the full list with an empty filter', () => {
    expect(buildEmoji({ filter: '' }).split('\n').length).toBeGreaterThanOrEqual(40);
  });
  it('filters by keyword', () => {
    const out = buildEmoji({ filter: 'heart' });
    expect(out).toContain('heart');
    expect(out).toContain('❤️');
  });
  it('returns a message when nothing matches', () => {
    expect(buildEmoji({ filter: 'zzzznotreal' })).toBe('No matches.');
  });
});

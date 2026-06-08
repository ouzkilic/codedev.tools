import { describe, it, expect } from 'vitest';
import { buildEntities } from './logic';

describe('buildEntities', () => {
  it('returns the full list with an empty filter', () => {
    const lines = buildEntities({ filter: '' }).split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(30);
  });

  it('filters by name', () => {
    expect(buildEntities({ filter: 'copy' })).toContain('&copy;');
  });

  it('filters by char/description for euro', () => {
    expect(buildEntities({ filter: 'euro' })).toContain('€');
  });

  it('returns No matches. when nothing matches', () => {
    expect(buildEntities({ filter: 'zzzzz' })).toBe('No matches.');
  });
});

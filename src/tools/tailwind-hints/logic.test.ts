import { describe, it, expect } from 'vitest';
import { buildTailwind } from './logic';

describe('buildTailwind', () => {
  it('returns the full map when filter is empty', () => {
    const out = buildTailwind({ filter: '' });
    expect(out.split('\n').length).toBeGreaterThanOrEqual(40);
  });
  it('filters by class to display: flex', () => {
    const out = buildTailwind({ filter: 'flex' });
    expect(out).toContain('display: flex');
  });
  it('returns a fallback when nothing matches', () => {
    const out = buildTailwind({ filter: 'zzznope' });
    expect(out).toBe('No matches.');
  });
});

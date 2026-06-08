import { describe, it, expect } from 'vitest';
import { buildCron } from './logic';

describe('buildCron', () => {
  it('returns the full cheatsheet when filter is empty', () => {
    const out = buildCron({ filter: '' });
    expect(out).toContain('minute');
    expect(out).toContain('@daily');
  });

  it('filters lines case-insensitively', () => {
    const out = buildCron({ filter: 'midnight' });
    const lines = out.split('\n');
    expect(out).toContain('midnight');
    expect(lines.every((l) => l.toLowerCase().includes('midnight'))).toBe(true);
    expect(lines.length).toBeLessThan(buildCron({ filter: '' }).split('\n').length);
  });
});

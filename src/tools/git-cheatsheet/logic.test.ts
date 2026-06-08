import { describe, it, expect } from 'vitest';
import { buildGit } from './logic';

describe('buildGit', () => {
  it('returns the full cheatsheet when filter is empty', () => {
    const out = buildGit({ filter: '' });
    expect(out).toContain('commit');
    expect(out).toContain('git init');
    expect(out.split('\n').length).toBeGreaterThanOrEqual(25);
  });
  it('filters to the rebase line', () => {
    const out = buildGit({ filter: 'rebase' });
    expect(out).toContain('git rebase <branch>');
    expect(out.toLowerCase()).not.toContain('git init');
  });
  it('filters to stash lines', () => {
    const out = buildGit({ filter: 'stash' });
    expect(out).toContain('stash');
  });
});

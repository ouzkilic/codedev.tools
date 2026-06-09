import { describe, it, expect } from 'vitest';
import { buildGit, GIT_OPTIONS } from './logic';

describe('GIT_OPTIONS', () => {
  it('exposes a single text filter option with sane defaults', () => {
    expect(GIT_OPTIONS).toHaveLength(1);
    const opt = GIT_OPTIONS[0];
    expect(opt.key).toBe('filter');
    expect(opt.type).toBe('text');
    expect(opt.default).toBe('');
    expect(opt.label).toBe('Search');
    expect(typeof opt.placeholder).toBe('string');
  });
});

describe('buildGit', () => {
  it('returns the full cheatsheet when filter is empty', () => {
    const out = buildGit({ filter: '' });
    expect(out).toContain('commit');
    expect(out).toContain('git init');
    expect(out.split('\n').length).toBeGreaterThanOrEqual(25);
  });

  it('returns the full cheatsheet when filter is undefined', () => {
    const out = buildGit({});
    const full = buildGit({ filter: '' });
    expect(out).toBe(full);
  });

  it('returns the full cheatsheet when filter is null', () => {
    const out = buildGit({ filter: null as unknown as string });
    const full = buildGit({ filter: '' });
    expect(out).toBe(full);
  });

  it('treats whitespace-only filter as empty (full cheatsheet)', () => {
    const out = buildGit({ filter: '   \t  ' });
    const full = buildGit({ filter: '' });
    expect(out).toBe(full);
  });

  it('full output includes all section headers', () => {
    const out = buildGit({ filter: '' });
    expect(out).toContain('# Setup & config');
    expect(out).toContain('# Basic snapshotting');
    expect(out).toContain('# Branching & merging');
    expect(out).toContain('# Sharing & updating');
    expect(out).toContain('# Inspection & history');
    expect(out).toContain('# Undoing & stashing');
    expect(out).toContain('# Tagging');
  });

  it('full output preserves blank separator lines between sections', () => {
    const out = buildGit({ filter: '' });
    expect(out.split('\n')).toContain('');
  });

  it('full output starts with the setup header', () => {
    const out = buildGit({ filter: '' });
    expect(out.split('\n')[0]).toBe('# Setup & config');
  });

  it('filters to the rebase line', () => {
    const out = buildGit({ filter: 'rebase' });
    expect(out).toContain('git rebase <branch>');
    expect(out.toLowerCase()).not.toContain('git init');
  });

  it('filters to stash lines', () => {
    const out = buildGit({ filter: 'stash' });
    expect(out).toContain('stash');
    const lines = out.split('\n');
    expect(lines).toContain('git stash  stash changes');
    expect(lines).toContain('git stash pop  restore stashed changes');
    // every returned line must contain the query
    for (const line of lines) {
      expect(line.toLowerCase()).toContain('stash');
    }
  });

  it('is case-insensitive (uppercase query matches lowercase content)', () => {
    const lower = buildGit({ filter: 'commit' });
    const upper = buildGit({ filter: 'COMMIT' });
    const mixed = buildGit({ filter: 'CoMmIt' });
    expect(upper).toBe(lower);
    expect(mixed).toBe(lower);
    expect(lower).toContain('git commit -m "msg"  commit');
  });

  it('trims surrounding whitespace from the query', () => {
    const trimmed = buildGit({ filter: 'rebase' });
    const padded = buildGit({ filter: '   rebase   ' });
    expect(padded).toBe(trimmed);
  });

  it('coerces non-string filter values to string', () => {
    // numeric filter is stringified; "123" matches nothing
    const out = buildGit({ filter: 123 as unknown as string });
    expect(out).toBe('');
  });

  it('excludes blank separator lines from filtered results', () => {
    const out = buildGit({ filter: 'git' });
    const lines = out.split('\n');
    expect(lines).not.toContain('');
    // headers do not start with git and are excluded
    expect(lines).not.toContain('# Tagging');
  });

  it('filtering by "git" returns only command lines', () => {
    const out = buildGit({ filter: 'git' });
    const lines = out.split('\n');
    for (const line of lines) {
      expect(line.startsWith('git ')).toBe(true);
    }
    // there are many git command lines (all begin with "git ")
    expect(lines.length).toBe(39);
  });

  it('returns empty string when nothing matches', () => {
    const out = buildGit({ filter: 'this-will-never-match-xyz' });
    expect(out).toBe('');
  });

  it('matches description text, not just the command', () => {
    const out = buildGit({ filter: 'upstream' });
    expect(out).toContain('git push -u origin <branch>  push and set upstream');
    expect(out.split('\n')).toHaveLength(1);
  });

  it('matches a header substring (# ) and section words', () => {
    const out = buildGit({ filter: 'tagging' });
    expect(out).toContain('# Tagging');
    // only the header contains the word "tagging"
    expect(out.split('\n')).toHaveLength(1);
  });

  it('handles special regex characters literally (no regex interpretation)', () => {
    // "<url>" contains regex-special chars but is matched as plain substring
    const out = buildGit({ filter: '<url>' });
    const lines = out.split('\n');
    expect(lines).toContain('git clone <url>  clone a repo');
    expect(lines).toContain('git remote add origin <url>  add a remote');
    for (const line of lines) {
      expect(line).toContain('<url>');
    }
  });

  it('handles dotted flags as literal substrings', () => {
    const out = buildGit({ filter: '--amend' });
    expect(out).toBe('git commit --amend  amend the last commit');
  });

  it('handles unicode / emoji query gracefully (no match)', () => {
    const out = buildGit({ filter: '🚀émoji' });
    expect(out).toBe('');
  });

  it('handles a very large query without throwing (no match)', () => {
    const big = 'x'.repeat(100000);
    expect(() => buildGit({ filter: big })).not.toThrow();
    expect(buildGit({ filter: big })).toBe('');
  });

  it('is deterministic: repeated calls produce identical output', () => {
    const a = buildGit({ filter: 'branch' });
    const b = buildGit({ filter: 'branch' });
    expect(a).toBe(b);
  });

  it('is idempotent for empty filter across calls', () => {
    expect(buildGit({ filter: '' })).toBe(buildGit({ filter: '' }));
  });

  it('a more specific query is a subset of a broader query', () => {
    const broad = buildGit({ filter: 'push' }).split('\n');
    const specific = buildGit({ filter: 'push --tags' }).split('\n');
    for (const line of specific) {
      expect(broad).toContain(line);
    }
    expect(specific).toContain('git push --tags  push tags');
  });

  it('matches "config" header and config command lines', () => {
    const out = buildGit({ filter: 'config' });
    const lines = out.split('\n');
    expect(lines).toContain('# Setup & config');
    expect(lines).toContain('git config --global user.name "name"  set your name');
    expect(lines).toContain('git config --global user.email "you@example.com"  set your email');
  });

  it('every non-empty filtered line contains the query (general invariant)', () => {
    const out = buildGit({ filter: 'remote' });
    for (const line of out.split('\n')) {
      expect(line.toLowerCase()).toContain('remote');
    }
  });
});

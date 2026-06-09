import { describe, it, expect } from 'vitest';
import { buildCron, CRON_OPTIONS } from './logic';

const FULL = buildCron({ filter: '' });
const FULL_LINES = FULL.split('\n');

describe('CRON_OPTIONS', () => {
  it('exposes a single text filter option with sane defaults', () => {
    expect(CRON_OPTIONS).toHaveLength(1);
    const opt = CRON_OPTIONS[0];
    expect(opt.key).toBe('filter');
    expect(opt.type).toBe('text');
    expect(opt.default).toBe('');
  });
});

describe('buildCron - full cheatsheet', () => {
  it('returns the full cheatsheet when filter is empty', () => {
    const out = buildCron({ filter: '' });
    expect(out).toContain('minute');
    expect(out).toContain('@daily');
  });

  it('contains all expected section headers', () => {
    expect(FULL).toContain('# Field layout');
    expect(FULL).toContain('# Operators');
    expect(FULL).toContain('# Special strings');
    expect(FULL).toContain('# Common examples');
  });

  it('contains every special string', () => {
    for (const s of ['@reboot', '@hourly', '@daily', '@weekly', '@monthly', '@yearly']) {
      expect(FULL).toContain(s);
    }
  });

  it('has the expected total number of lines', () => {
    // 33 source lines (including 3 blank separators)
    expect(FULL_LINES).toHaveLength(33);
  });

  it('preserves blank separator lines between sections', () => {
    expect(FULL_LINES.filter((l) => l === '').length).toBe(3);
  });
});

describe('buildCron - missing / nullish / whitespace filter', () => {
  it('returns full sheet when filter is undefined', () => {
    expect(buildCron({})).toBe(FULL);
  });

  it('returns full sheet when filter is null', () => {
    expect(buildCron({ filter: null as unknown as string })).toBe(FULL);
  });

  it('returns full sheet for whitespace-only filter (trimmed away)', () => {
    expect(buildCron({ filter: '   ' })).toBe(FULL);
    expect(buildCron({ filter: '\t\n ' })).toBe(FULL);
  });

  it('returns full sheet when filter is empty string', () => {
    expect(buildCron({ filter: '' })).toBe(FULL);
  });
});

describe('buildCron - filtering behaviour', () => {
  it('filters lines case-insensitively', () => {
    const out = buildCron({ filter: 'midnight' });
    const lines = out.split('\n');
    expect(out).toContain('midnight');
    expect(lines.every((l) => l.toLowerCase().includes('midnight'))).toBe(true);
    expect(lines.length).toBeLessThan(FULL_LINES.length);
  });

  it('treats uppercase query the same as lowercase', () => {
    expect(buildCron({ filter: 'MIDNIGHT' })).toBe(buildCron({ filter: 'midnight' }));
    expect(buildCron({ filter: 'MiDnIgHt' })).toBe(buildCron({ filter: 'midnight' }));
  });

  it('trims surrounding whitespace from the query before matching', () => {
    expect(buildCron({ filter: '  midnight  ' })).toBe(buildCron({ filter: 'midnight' }));
  });

  it('matches lines that uppercase-include the lowercased query (month JAN-DEC)', () => {
    // query 'jan' lowercased matches 'month  1-12 (or JAN-DEC)' because line is lowercased too
    const out = buildCron({ filter: 'jan' });
    expect(out).toContain('JAN-DEC');
    expect(out).toContain('January');
  });

  it('returns only the @daily line when filtering for @daily', () => {
    const out = buildCron({ filter: '@daily' });
    expect(out.split('\n')).toEqual([
      '@daily    run once a day at midnight (0 0 * * *)',
    ]);
  });

  it('matches multiple lines for a shared substring', () => {
    const out = buildCron({ filter: 'every 5 minutes' });
    expect(out).toBe('*/5 * * * *    every 5 minutes');
  });

  it('finds all special-string lines via the @ prefix', () => {
    const out = buildCron({ filter: '@' });
    const lines = out.split('\n');
    expect(lines).toHaveLength(6);
    expect(lines.every((l) => l.includes('@'))).toBe(true);
  });

  it('matches the literal asterisk operator character', () => {
    const out = buildCron({ filter: '*/5' });
    const lines = out.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(1);
    expect(lines.every((l) => l.includes('*/5'))).toBe(true);
    expect(out).toContain('*/5 * * * *');
  });

  it('matches comment header lines starting with #', () => {
    const out = buildCron({ filter: '#' });
    const lines = out.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines.every((l) => l.startsWith('#'))).toBe(true);
  });
});

describe('buildCron - no matches', () => {
  it('returns an empty string when nothing matches', () => {
    expect(buildCron({ filter: 'zzzznotpresent' })).toBe('');
  });

  it('returns empty string for unicode/emoji that is absent', () => {
    expect(buildCron({ filter: '🚀' })).toBe('');
    expect(buildCron({ filter: 'ünïcödé' })).toBe('');
  });

  it('returns empty string for a very long absent query', () => {
    expect(buildCron({ filter: 'x'.repeat(5000) })).toBe('');
  });
});

describe('buildCron - special characters in query', () => {
  it('treats query as a literal substring, not a regex', () => {
    // '.*' is a regex catch-all but as a literal substring it appears nowhere
    expect(buildCron({ filter: '.*' })).toBe('');
  });

  it('matches a literal range operator hyphen segment', () => {
    const out = buildCron({ filter: '1-5' });
    const lines = out.split('\n');
    expect(lines.every((l) => l.includes('1-5'))).toBe(true);
    expect(out).toContain('weekdays at 9am');
  });

  it('matches the value-list separator example', () => {
    const out = buildCron({ filter: '1,15,30' });
    expect(out).toBe(',    value list separator (1,15,30)');
  });
});

describe('buildCron - determinism & coercion', () => {
  it('is deterministic for repeated identical calls', () => {
    expect(buildCron({ filter: 'hour' })).toBe(buildCron({ filter: 'hour' }));
    expect(buildCron({})).toBe(buildCron({}));
  });

  it('coerces non-string filter values via String()', () => {
    // number 0 -> "0", which appears in many cron lines
    const out = buildCron({ filter: 0 as unknown as string });
    expect(out.length).toBeGreaterThan(0);
    expect(out.split('\n').every((l) => l.includes('0'))).toBe(true);
  });

  it('every filtered result is a subset of the full sheet lines', () => {
    const out = buildCron({ filter: 'every' });
    const fullSet = new Set(FULL_LINES);
    expect(out.split('\n').every((l) => fullSet.has(l))).toBe(true);
  });

  it('returned line order matches source order', () => {
    const out = buildCron({ filter: 'minute' }).split('\n');
    const indices = out.map((l) => FULL_LINES.indexOf(l));
    const sorted = [...indices].sort((a, b) => a - b);
    expect(indices).toEqual(sorted);
  });
});

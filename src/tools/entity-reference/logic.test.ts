import { describe, it, expect } from 'vitest';
import { buildEntities } from './logic';

const TOTAL = 59;

describe('buildEntities', () => {
  it('returns the full list with an empty filter', () => {
    const lines = buildEntities({ filter: '' }).split('\n');
    expect(lines.length).toBe(TOTAL);
  });

  it('returns the full list when filter is undefined', () => {
    const lines = buildEntities({}).split('\n');
    expect(lines.length).toBe(TOTAL);
  });

  it('returns the full list when filter is null', () => {
    const lines = buildEntities({ filter: null as unknown as string }).split('\n');
    expect(lines.length).toBe(TOTAL);
  });

  it('treats whitespace-only filter as empty (full list)', () => {
    const lines = buildEntities({ filter: '   \t  ' }).split('\n');
    expect(lines.length).toBe(TOTAL);
  });

  it('formats each row as name<TAB>char<TAB>desc', () => {
    const first = buildEntities({ filter: '' }).split('\n')[0];
    expect(first).toBe('&amp;\t&\tampersand');
    const parts = first.split('\t');
    expect(parts).toHaveLength(3);
  });

  it('filters by name', () => {
    expect(buildEntities({ filter: 'copy' })).toContain('&copy;');
  });

  it('filters by char/description for euro', () => {
    expect(buildEntities({ filter: 'euro' })).toContain('€');
  });

  it('matches against the entity name token', () => {
    // 'amp' appears in &amp; name; should include the ampersand row
    const out = buildEntities({ filter: 'amp' });
    expect(out).toContain('&amp;\t&\tampersand');
  });

  it('matches against the description text', () => {
    // 'arrow' only appears in descriptions, not names
    const out = buildEntities({ filter: 'arrow' });
    const lines = out.split('\n');
    expect(lines.every((l) => l.toLowerCase().includes('arrow'))).toBe(true);
    expect(out).toContain('&larr;');
    expect(out).toContain('&rarr;');
    expect(out).toContain('&uarr;');
    expect(out).toContain('&darr;');
    expect(out).toContain('&harr;');
    expect(lines.length).toBe(5);
  });

  it('is case-insensitive on the query', () => {
    expect(buildEntities({ filter: 'COPY' })).toBe(buildEntities({ filter: 'copy' }));
    expect(buildEntities({ filter: 'EuRo' })).toBe(buildEntities({ filter: 'euro' }));
  });

  it('trims surrounding whitespace from the query', () => {
    expect(buildEntities({ filter: '  copy  ' })).toBe(buildEntities({ filter: 'copy' }));
  });

  it('returns No matches. when nothing matches', () => {
    expect(buildEntities({ filter: 'zzzzz' })).toBe('No matches.');
  });

  it('returns No matches. for emoji input that is not present', () => {
    expect(buildEntities({ filter: '🚀' })).toBe('No matches.');
  });

  it('can match a literal unicode char from the description set', () => {
    // querying 'dash' should surface em dash and en dash
    const out = buildEntities({ filter: 'dash' });
    expect(out).toContain('&mdash;\t—\tem dash');
    expect(out).toContain('&ndash;\t–\ten dash');
  });

  it('does not match against the entity char column', () => {
    // The literal char '©' is not part of name or desc lowercase search,
    // so searching for it yields no matches.
    expect(buildEntities({ filter: '©' })).toBe('No matches.');
  });

  it('coerces a non-string filter to string', () => {
    // number 12 -> '12' which matches frac12 / frac14? only '12' substring
    const out = buildEntities({ filter: 12 as unknown as string });
    expect(out).toContain('&frac12;');
    expect(out.split('\n').every((l) => l.includes('12'))).toBe(true);
  });

  it('handles a number filter of 2 matching superscript two and frac12', () => {
    const out = buildEntities({ filter: 2 as unknown as string });
    expect(out).toContain('&sup2;');
    expect(out).toContain('&frac12;');
  });

  it('returns deterministic output across repeated calls', () => {
    const a = buildEntities({ filter: 'arrow' });
    const b = buildEntities({ filter: 'arrow' });
    expect(a).toBe(b);
  });

  it('every full-list row has exactly three tab-separated columns', () => {
    const lines = buildEntities({ filter: '' }).split('\n');
    for (const line of lines) {
      expect(line.split('\t')).toHaveLength(3);
    }
  });

  it('full list contains expected boundary entities (first and last)', () => {
    const out = buildEntities({ filter: '' });
    expect(out.startsWith('&amp;\t&\tampersand')).toBe(true);
    expect(out.endsWith('&loz;\t◊\tlozenge')).toBe(true);
  });

  it('partial substring in the middle of a description matches', () => {
    // 'sign' appears in 'micro sign' and 'section sign'
    const out = buildEntities({ filter: 'sign' });
    expect(out).toContain('&micro;');
    expect(out).toContain('&sect;');
  });

  it('matches semicolon-bearing name fragments', () => {
    const out = buildEntities({ filter: 'quot' });
    expect(out).toContain('&quot;\t"\tdouble quote');
  });

  it('handles very large input without throwing and returns No matches.', () => {
    const big = 'x'.repeat(100000);
    expect(buildEntities({ filter: big })).toBe('No matches.');
  });

  it('a leading ampersand still filters by name', () => {
    const out = buildEntities({ filter: '&copy;' });
    expect(out).toBe('&copy;\t©\tcopyright');
  });

  it('does not throw on special regex chars in filter', () => {
    expect(() => buildEntities({ filter: '.*+?[](){}' })).not.toThrow();
    expect(buildEntities({ filter: '.*+?[](){}' })).toBe('No matches.');
  });
});

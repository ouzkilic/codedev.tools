import { describe, it, expect } from 'vitest';
import { buildRegex, REGEX_OPTIONS } from './logic';

const ALL_LINES = 30;

describe('REGEX_OPTIONS', () => {
  it('exposes a single text filter option with empty default', () => {
    expect(REGEX_OPTIONS).toHaveLength(1);
    const opt = REGEX_OPTIONS[0];
    expect(opt.key).toBe('filter');
    expect(opt.type).toBe('text');
    expect(opt.default).toBe('');
    expect(opt.label).toBe('Search');
  });
});

describe('buildRegex', () => {
  it('returns full list when filter is empty', () => {
    const out = buildRegex({ filter: '' });
    expect(out).toContain('digit');
    expect(out).toContain('\\d');
    expect(out).toContain('\\b');
  });

  it('returns full list when filter is whitespace-only (trimmed to empty)', () => {
    const out = buildRegex({ filter: '   \t  ' });
    expect(out.split('\n')).toHaveLength(ALL_LINES);
    expect(out).toContain('\\d  digit');
  });

  it('returns full list when filter key is missing (undefined coerced)', () => {
    const out = buildRegex({});
    expect(out.split('\n')).toHaveLength(ALL_LINES);
  });

  it('returns full list when filter is null', () => {
    const out = buildRegex({ filter: null as unknown as string });
    expect(out.split('\n')).toHaveLength(ALL_LINES);
  });

  it('full list contains exactly 30 newline-joined lines', () => {
    const out = buildRegex({ filter: '' });
    const lines = out.split('\n');
    expect(lines).toHaveLength(ALL_LINES);
    expect(lines[0]).toBe('\\d  digit');
    expect(lines[lines.length - 1]).toBe('\\t  tab');
  });

  it('filters by word boundary, excluding unrelated tokens', () => {
    const out = buildRegex({ filter: 'word boundary' });
    expect(out).toContain('\\b  word boundary');
    expect(out).not.toContain('any char');
  });

  it('filters by "digit" and matches both digit and non-digit lines', () => {
    const out = buildRegex({ filter: 'digit' });
    const lines = out.split('\n');
    expect(lines).toContain('\\d  digit');
    expect(lines).toContain('\\D  non-digit');
    expect(lines).toHaveLength(2);
  });

  it('is case-insensitive (uppercase query matches lowercase text)', () => {
    const out = buildRegex({ filter: 'DIGIT' });
    expect(out).toContain('\\d  digit');
    expect(out).toContain('\\D  non-digit');
  });

  it('is case-insensitive (mixed case query)', () => {
    const out = buildRegex({ filter: 'WhItEsPaCe' });
    const lines = out.split('\n');
    expect(lines).toContain('\\s  whitespace');
    expect(lines).toContain('\\S  non-whitespace');
    expect(lines).toHaveLength(2);
  });

  it('trims surrounding whitespace from the query before matching', () => {
    const out = buildRegex({ filter: '   group   ' });
    const lines = out.split('\n');
    expect(lines).toContain('(...)  group');
    expect(lines).toContain('(?<name>...)  named group');
    expect(lines).not.toContain('(?:...)  non-capturing');
    expect(lines).toHaveLength(2);
  });

  it('matches on the regex token text, not just the description', () => {
    const out = buildRegex({ filter: 'lookahead' });
    const lines = out.split('\n');
    expect(lines).toContain('(?=...)  lookahead');
    expect(lines).toContain('(?!...)  negative lookahead');
    expect(lines).toHaveLength(2);
  });

  it('returns empty string when nothing matches', () => {
    const out = buildRegex({ filter: 'zzznomatchzzz' });
    expect(out).toBe('');
  });

  it('treats the query as a literal substring, not a regex pattern', () => {
    // '.' would match everything if interpreted as regex; here only the
    // literal "." substring lines should appear.
    const out = buildRegex({ filter: '.  any' });
    const lines = out.split('\n');
    expect(lines).toContain('.  any char');
    expect(lines).toHaveLength(1);
  });

  it('matches literal backslash sequences like "\\\\d" case-insensitively', () => {
    // lowercasing '\\D  non-digit' yields '\\d  non-digit' which contains '\\d'.
    const out = buildRegex({ filter: '\\d' });
    const lines = out.split('\n');
    expect(lines).toContain('\\d  digit');
    expect(lines).toContain('\\D  non-digit');
    expect(lines).toHaveLength(2);
  });

  it('matches the literal "\\s" substring only in whitespace rows', () => {
    const out = buildRegex({ filter: '\\s' });
    const lines = out.split('\n');
    expect(lines).toContain('\\s  whitespace');
    expect(lines).toContain('\\S  non-whitespace');
    // every returned line must literally contain the backslash-s sequence
    for (const line of lines) {
      expect(line.toLowerCase()).toContain('\\s');
    }
  });

  it('matches square-bracket tokens by literal substring', () => {
    // '[abc]' is NOT a substring of '[^abc]' (which has the caret), so only
    // the plain set line matches.
    const out = buildRegex({ filter: '[abc]' });
    const lines = out.split('\n');
    expect(lines).toContain('[abc]  set');
    expect(lines).not.toContain('[^abc]  negated set');
    expect(lines).toHaveLength(1);
  });

  it('matches the negated-set token with its caret', () => {
    const out = buildRegex({ filter: '[^abc]' });
    expect(out).toBe('[^abc]  negated set');
  });

  it('matches a unique description fragment', () => {
    const out = buildRegex({ filter: 'alternation' });
    expect(out).toBe('a|b  alternation');
  });

  it('matches "non-" prefix across many negated tokens', () => {
    const out = buildRegex({ filter: 'non-' });
    const lines = out.split('\n');
    expect(lines).toContain('\\D  non-digit');
    expect(lines).toContain('\\W  non-word');
    expect(lines).toContain('\\S  non-whitespace');
    expect(lines).toContain('\\B  non-word boundary');
    expect(lines).toContain('(?:...)  non-capturing');
    expect(lines).toHaveLength(5);
  });

  it('returns empty string for unicode/emoji queries that never appear', () => {
    expect(buildRegex({ filter: '🚀' })).toBe('');
    expect(buildRegex({ filter: 'çğşü' })).toBe('');
  });

  it('handles a very large query string without matching', () => {
    const big = 'x'.repeat(100000);
    expect(buildRegex({ filter: big })).toBe('');
  });

  it('coerces a numeric filter value via String()', () => {
    // String(0) === '0' (non-empty) -> filters; lines containing "0" match.
    const out = buildRegex({ filter: 0 as unknown as string });
    const lines = out.split('\n');
    expect(lines).toContain('*  0 or more');
    expect(lines).toContain('?  0 or 1');
    expect(lines).toHaveLength(2);
  });

  it('coerces numeric "n" present in brace quantifier descriptions', () => {
    const out = buildRegex({ filter: 'exactly n' });
    expect(out).toBe('{n}  exactly n');
  });

  it('is deterministic across repeated calls with the same input', () => {
    const a = buildRegex({ filter: 'group' });
    const b = buildRegex({ filter: 'group' });
    expect(a).toBe(b);
  });

  it('every line in the full list contains a two-space separator', () => {
    const out = buildRegex({ filter: '' });
    for (const line of out.split('\n')) {
      expect(line).toContain('  ');
    }
  });

  it('newline and tab tokens are present and filterable', () => {
    expect(buildRegex({ filter: 'newline' })).toBe('\\n  newline');
    expect(buildRegex({ filter: 'tab' })).toBe('\\t  tab');
  });
});

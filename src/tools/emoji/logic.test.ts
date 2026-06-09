import { describe, it, expect } from 'vitest';
import { buildEmoji, EMOJI_OPTIONS } from './logic';

const TOTAL = 64;

describe('EMOJI_OPTIONS', () => {
  it('exposes a single text filter option', () => {
    expect(EMOJI_OPTIONS).toHaveLength(1);
    expect(EMOJI_OPTIONS[0].key).toBe('filter');
    expect(EMOJI_OPTIONS[0].type).toBe('text');
    expect(EMOJI_OPTIONS[0].default).toBe('');
  });
});

describe('buildEmoji', () => {
  it('returns the full list with an empty filter', () => {
    const out = buildEmoji({ filter: '' });
    expect(out.split('\n')).toHaveLength(TOTAL);
  });

  it('returns the full list when filter is missing (nullish)', () => {
    expect(buildEmoji({}).split('\n')).toHaveLength(TOTAL);
  });

  it('treats whitespace-only filter as empty (trimmed) -> full list', () => {
    expect(buildEmoji({ filter: '   ' }).split('\n')).toHaveLength(TOTAL);
    expect(buildEmoji({ filter: '\t\n ' }).split('\n')).toHaveLength(TOTAL);
  });

  it('formats each line as "emoji  keywords" with two spaces', () => {
    const first = buildEmoji({ filter: '' }).split('\n')[0];
    expect(first).toBe('😀  grinning face smile happy');
    expect(first).toMatch(/^\S+ {2}.+$/);
  });

  it('filters by keyword', () => {
    const out = buildEmoji({ filter: 'heart' });
    expect(out).toContain('heart');
    expect(out).toContain('❤️');
  });

  it('returns a message when nothing matches', () => {
    expect(buildEmoji({ filter: 'zzzznotreal' })).toBe('No matches.');
  });

  it('is case-insensitive', () => {
    const lower = buildEmoji({ filter: 'rocket' });
    const upper = buildEmoji({ filter: 'ROCKET' });
    const mixed = buildEmoji({ filter: 'RoCkEt' });
    expect(lower).toBe(upper);
    expect(lower).toBe(mixed);
    expect(lower).toContain('🚀');
  });

  it('trims surrounding whitespace before matching', () => {
    expect(buildEmoji({ filter: '  rocket  ' })).toBe(buildEmoji({ filter: 'rocket' }));
  });

  it('matches a unique single keyword to exactly one emoji', () => {
    const out = buildEmoji({ filter: 'rocket' });
    expect(out.split('\n')).toHaveLength(1);
    expect(out).toBe('🚀  rocket launch ship fast space');
  });

  it('does substring (not whole-word) matching', () => {
    // 'lol' is a substring inside 'face tears of joy laugh cry funny lol'
    const out = buildEmoji({ filter: 'lol' });
    expect(out).toContain('😂');
  });

  it('matches a substring that spans within a single keyword token', () => {
    // 'ngry' is inside 'angry'
    const out = buildEmoji({ filter: 'ngry' });
    expect(out).toContain('😡');
  });

  it('returns multiple results for a shared keyword', () => {
    const out = buildEmoji({ filter: 'love' });
    const lines = out.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    // every line must contain the matched keyword
    for (const line of lines) {
      expect(line).toContain('love');
    }
  });

  it('every returned line contains the query for "happy"', () => {
    const out = buildEmoji({ filter: 'happy' });
    const lines = out.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.toLowerCase()).toContain('happy');
    }
  });

  it('accepts a query that is itself an emoji glyph (no keyword contains it) -> no matches', () => {
    expect(buildEmoji({ filter: '🚀' })).toBe('No matches.');
  });

  it('matches a numeric keyword', () => {
    const out = buildEmoji({ filter: '100' });
    expect(out).toContain('💯');
    expect(out.split('\n')).toHaveLength(1);
  });

  it('coerces a non-string filter via String() before matching', () => {
    // number 100 -> "100" matches the hundred points keyword
    expect(buildEmoji({ filter: 100 as unknown as string })).toContain('💯');
  });

  it('treats numeric 0 as a truthy (non-empty) query after String coercion', () => {
    // String(0) = "0", trimmed = "0" which is truthy -> filters; "0" is a substring of "100"
    const out = buildEmoji({ filter: 0 as unknown as string });
    expect(out).toContain('💯');
    expect(out.split('\n')).toHaveLength(1);
  });

  it('does not match the empty-string fallback path for special chars with no hits', () => {
    expect(buildEmoji({ filter: '%%%' })).toBe('No matches.');
    expect(buildEmoji({ filter: '!@#$' })).toBe('No matches.');
  });

  it('handles a very large input gracefully (no match, no crash)', () => {
    const big = 'x'.repeat(100000);
    expect(buildEmoji({ filter: big })).toBe('No matches.');
  });

  it('is deterministic and idempotent for the same query', () => {
    const a = buildEmoji({ filter: 'star' });
    const b = buildEmoji({ filter: 'star' });
    expect(a).toBe(b);
  });

  it('preserves source ordering of the emoji list in output', () => {
    // 'smile' appears in several entries; first ones should precede later ones
    const out = buildEmoji({ filter: 'love' });
    const lines = out.split('\n');
    const heartEyesIdx = lines.findIndex((l) => l.startsWith('😍'));
    const adoreIdx = lines.findIndex((l) => l.includes('adore'));
    expect(heartEyesIdx).toBeGreaterThanOrEqual(0);
    expect(adoreIdx).toBeGreaterThanOrEqual(0);
    expect(heartEyesIdx).toBeLessThan(adoreIdx);
  });

  it('returns a string in every branch', () => {
    expect(typeof buildEmoji({ filter: '' })).toBe('string');
    expect(typeof buildEmoji({ filter: 'fire' })).toBe('string');
    expect(typeof buildEmoji({ filter: 'nope-nope' })).toBe('string');
  });

  it('full list contains no blank lines and each line is well-formed', () => {
    const lines = buildEmoji({ filter: '' }).split('\n');
    for (const line of lines) {
      expect(line.length).toBeGreaterThan(0);
      expect(line).toContain('  ');
    }
  });

  it('matches the "fire" emoji exactly', () => {
    expect(buildEmoji({ filter: 'fire' })).toBe('🔥  fire flame lit hot');
  });
});

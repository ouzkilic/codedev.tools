import { describe, it, expect } from 'vitest';
import { buildTailwind, TAILWIND_OPTIONS } from './logic';

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

  it('formats each line as "class  ->  css"', () => {
    // "cursor-pointer" is a unique substring, so exactly one line is returned.
    const out = buildTailwind({ filter: 'cursor-pointer' });
    expect(out).toBe('cursor-pointer  ->  cursor: pointer');
  });

  it('treats a missing filter (undefined) as empty and returns the full map', () => {
    const out = buildTailwind({});
    const lines = out.split('\n');
    // Full map has 72 entries (see MAP in logic.ts).
    expect(lines.length).toBe(72);
    expect(lines[0]).toBe('flex  ->  display: flex');
  });

  it('treats null filter as empty (full map)', () => {
    const out = buildTailwind({ filter: null as unknown as string });
    expect(out.split('\n').length).toBe(72);
  });

  it('trims surrounding whitespace from the filter', () => {
    const out = buildTailwind({ filter: '   cursor-pointer   ' });
    expect(out).toBe('cursor-pointer  ->  cursor: pointer');
  });

  it('treats a whitespace-only filter as empty (full map)', () => {
    const out = buildTailwind({ filter: '   ' });
    expect(out.split('\n').length).toBe(72);
  });

  it('is case-insensitive on the query', () => {
    const lower = buildTailwind({ filter: 'flex' });
    const upper = buildTailwind({ filter: 'FLEX' });
    const mixed = buildTailwind({ filter: 'FlEx' });
    expect(upper).toBe(lower);
    expect(mixed).toBe(lower);
  });

  it('matches against the class name substring', () => {
    const out = buildTailwind({ filter: 'rounded' });
    const lines = out.split('\n');
    expect(lines).toContain('rounded  ->  border-radius: 0.25rem');
    expect(lines).toContain('rounded-lg  ->  border-radius: 0.5rem');
    expect(lines).toContain('rounded-full  ->  border-radius: 9999px');
    expect(lines.length).toBe(3);
  });

  it('matches against the CSS declaration substring', () => {
    // "position:" only appears on the CSS side, not in any class name.
    const out = buildTailwind({ filter: 'position:' });
    const lines = out.split('\n');
    expect(lines).toContain('absolute  ->  position: absolute');
    expect(lines).toContain('relative  ->  position: relative');
    expect(lines).toContain('fixed  ->  position: fixed');
    expect(lines).toContain('sticky  ->  position: sticky');
    expect(lines).toContain('static  ->  position: static');
    expect(lines.length).toBe(5);
  });

  it('matches a value that appears only inside the CSS (rem)', () => {
    const out = buildTailwind({ filter: '0.5rem' });
    // Each matched line should contain "0.5rem" in its CSS.
    for (const line of out.split('\n')) {
      expect(line).toContain('0.5rem');
    }
    expect(out).toContain('gap-2  ->  gap: 0.5rem');
  });

  it('returns a single line when the query matches exactly one entry', () => {
    const out = buildTailwind({ filter: 'min-h-screen' });
    expect(out).toBe('min-h-screen  ->  min-height: 100vh');
    expect(out.split('\n').length).toBe(1);
  });

  it('returns the fallback for emoji/unicode input that cannot match', () => {
    expect(buildTailwind({ filter: '🚀✨' })).toBe('No matches.');
  });

  it('returns the fallback for a long non-matching string', () => {
    const big = 'x'.repeat(5000);
    expect(buildTailwind({ filter: big })).toBe('No matches.');
  });

  it('coerces a non-string filter value to string before matching', () => {
    // numeric 2 -> "2"; matches classes/css containing "2" (e.g. gap-2, p-2, 0.5rem? no).
    const out = buildTailwind({ filter: 2 as unknown as string });
    const lines = out.split('\n');
    expect(lines.every((l) => l.includes('2'))).toBe(true);
    expect(lines).toContain('gap-2  ->  gap: 0.5rem');
  });

  it('every full-map line follows the "  ->  " separator format', () => {
    const out = buildTailwind({ filter: '' });
    for (const line of out.split('\n')) {
      expect(line).toMatch(/^.+ {2}-> {2}.+$/);
    }
  });

  it('exposes a single text filter option with sensible defaults', () => {
    expect(TAILWIND_OPTIONS).toHaveLength(1);
    const opt = TAILWIND_OPTIONS[0];
    expect(opt.key).toBe('filter');
    expect(opt.type).toBe('text');
    expect(opt.default).toBe('');
  });
});

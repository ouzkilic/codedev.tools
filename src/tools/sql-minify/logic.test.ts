import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { sqlMinifyLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const run = (input: string) => sqlMinifyLogic.transform(input, ctx);

describe('sqlMinifyLogic', () => {
  // --- existing assertions (kept) ---
  it('removes line comments and collapses newlines', () => {
    expect(run('SELECT *\nFROM t -- comment')).toBe('SELECT * FROM t');
  });

  it('removes block comments', () => {
    expect(run('SELECT /* x */ 1')).toBe('SELECT 1');
  });

  it('collapses multiple spaces and newlines', () => {
    expect(run('SELECT   a,\n\n  b\nFROM   t')).toBe('SELECT a, b FROM t');
  });

  // --- empty / whitespace ---
  it('returns empty string for empty input', () => {
    expect(run('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(run('   \n\t  \r\n ')).toBe('');
  });

  it('trims leading and trailing whitespace', () => {
    expect(run('   SELECT 1   ')).toBe('SELECT 1');
  });

  // --- block comments ---
  it('removes multiline block comments', () => {
    expect(run('SELECT 1\n/* multi\n line\n comment */\nFROM t')).toBe('SELECT 1 FROM t');
  });

  it('removes multiple separate block comments', () => {
    expect(run('/* a */ SELECT /* b */ 1 /* c */')).toBe('SELECT 1');
  });

  it('handles non-greedy block comment matching (does not eat between comments)', () => {
    // Non-greedy *? means each */ closes its own comment, keeping "KEEP" intact.
    expect(run('/* one */ KEEP /* two */')).toBe('KEEP');
  });

  it('removes empty block comment', () => {
    expect(run('SELECT/**/1')).toBe('SELECT 1');
  });

  // --- line comments ---
  it('removes line comment to end of line but keeps following line', () => {
    expect(run('SELECT 1 -- drop this\nFROM t')).toBe('SELECT 1 FROM t');
  });

  it('removes a line comment at the very start', () => {
    expect(run('-- header comment\nSELECT 1')).toBe('SELECT 1');
  });

  it('line comment without trailing newline removes rest of input', () => {
    expect(run('SELECT 1 -- trailing')).toBe('SELECT 1');
  });

  it('removes consecutive line comments', () => {
    expect(run('-- a\n-- b\nSELECT 1')).toBe('SELECT 1');
  });

  // --- ordering: block comments removed before line/whitespace ---
  it('removes block comment that spans what looks like a line comment', () => {
    expect(run('SELECT /* -- not a line comment */ 1')).toBe('SELECT 1');
  });

  // --- whitespace variants ---
  it('collapses tabs to single spaces', () => {
    expect(run('SELECT\ta,\tb')).toBe('SELECT a, b');
  });

  it('collapses carriage returns and mixed whitespace', () => {
    expect(run('SELECT\r\n\r\n  1')).toBe('SELECT 1');
  });

  it('collapses a single internal run of many spaces to one', () => {
    expect(run('a' + ' '.repeat(50) + 'b')).toBe('a b');
  });

  // --- content preservation ---
  it('preserves SQL operators and punctuation', () => {
    expect(run('SELECT a>=1 AND b<=2, c<>3')).toBe('SELECT a>=1 AND b<=2, c<>3');
  });

  it('keeps a query with no comments unchanged except whitespace', () => {
    expect(run('INSERT INTO t (a,b) VALUES (1,2)')).toBe('INSERT INTO t (a,b) VALUES (1,2)');
  });

  // --- unicode / special chars ---
  it('preserves unicode and emoji content', () => {
    expect(run("SELECT 'çağrı 🚀' AS x")).toBe("SELECT 'çağrı 🚀' AS x");
  });

  it('preserves numeric and negative/zero literals', () => {
    expect(run('SELECT -1, 0, 3.14, -0.5')).toBe('SELECT -1, 0, 3.14, -0.5');
  });

  // --- idempotency / determinism ---
  it('is idempotent: minifying an already-minified query yields the same output', () => {
    const once = run('SELECT *\nFROM t -- c\n/* b */ WHERE x = 1');
    expect(run(once)).toBe(once);
  });

  it('is deterministic across repeated calls', () => {
    const input = 'SELECT   a /* x */\n-- y\nFROM t';
    expect(run(input)).toBe(run(input));
  });

  // --- large input ---
  it('handles very large input', () => {
    const input = Array.from({ length: 2000 }, (_, i) => `SELECT ${i} -- c${i}`).join('\n');
    const out = run(input);
    expect(out).toContain('SELECT 0');
    expect(out).toContain('SELECT 1999');
    expect(out).not.toContain('--');
    expect(out).not.toMatch(/\n/);
  });

  // --- single space between line-comment-stripped tokens via newline collapse ---
  it('produces single space where comment removal leaves blank lines', () => {
    expect(run('A\n-- comment\nB')).toBe('A B');
  });
});

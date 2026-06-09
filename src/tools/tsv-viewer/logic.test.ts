import { describe, it, expect } from 'vitest';
import { tsvViewerLogic } from './logic';

describe('tsvViewerLogic', () => {
  it('aligns a simple TSV into a table', () => {
    const out = tsvViewerLogic.transform('a\tbb\n1\t2');
    expect(out).toContain('a | bb');
    expect(out).toContain('1 | 2');
  });

  it('includes a dashes separator line after the header', () => {
    const out = tsvViewerLogic.transform('a\tbb\n1\t2');
    const lines = out.split('\n');
    expect(lines[1]).toMatch(/^-+/);
    expect(lines[1]).toContain('-');
  });

  it('pads columns to the max width', () => {
    const out = tsvViewerLogic.transform('name\tx\nlonger\ty');
    expect(out).toContain('name   | x');
    expect(out).toContain('longer | y');
  });

  it('handles a single column', () => {
    const out = tsvViewerLogic.transform('foo\nbar');
    expect(out).toContain('foo');
    expect(out).toContain('bar');
  });

  it('throws on empty input', () => {
    expect(() => tsvViewerLogic.transform('   ')).toThrow();
  });

  // --- structure of the output ---

  it('produces exactly header + separator + data rows', () => {
    const out = tsvViewerLogic.transform('h1\th2\nr1\tr2\nr3\tr4');
    const lines = out.split('\n');
    // header, separator, 2 data rows
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('h1 | h2');
    expect(lines[1]).toMatch(/^-+\+-+$/);
    expect(lines[2]).toBe('r1 | r2');
    expect(lines[3]).toBe('r3 | r4');
  });

  it('builds the separator from per-column dashes joined with -+-', () => {
    // widths: col0 = max(len('a'),len('1')) = 1, col1 = max(len('bb'),len('2')) = 2
    // separator = '-'.repeat(1) + '-+-' + '-'.repeat(2) = '-' + '-+-' + '--'
    const out = tsvViewerLogic.transform('a\tbb\n1\t2');
    const lines = out.split('\n');
    expect(lines[1]).toBe('--+---');
  });

  it('separator dash segments match the padded column widths', () => {
    const out = tsvViewerLogic.transform('name\tx\nlonger\ty');
    const lines = out.split('\n');
    // col0 width 6 (longer), col1 width 1 (x/y) -> '------' + '-+-' + '-'
    expect(lines[1]).toBe('-------+--');
  });

  // --- single column ---

  it('formats a single column without a pipe delimiter', () => {
    const out = tsvViewerLogic.transform('foo\nbar');
    const lines = out.split('\n');
    expect(lines[0]).toBe('foo');
    expect(lines[1]).toBe('---');
    expect(lines[2]).toBe('bar');
    expect(lines[0]).not.toContain('|');
  });

  it('handles a single row (header only, no data rows)', () => {
    const out = tsvViewerLogic.transform('only\trow');
    const lines = out.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('only | row');
    expect(lines[1]).toMatch(/^-+\+-+$/);
  });

  // --- ragged rows / missing cells ---

  it('pads short rows to the maximum column count', () => {
    // row 2 has only one cell; colCount derived from widest row (3)
    const out = tsvViewerLogic.transform('a\tb\tc\nx');
    const lines = out.split('\n');
    expect(lines[0]).toBe('a | b | c');
    // missing cells become empty strings, still padded to width
    expect(lines[2]).toBe('x |   |  ');
  });

  it('uses the widest row to determine column count even if header is shorter', () => {
    const out = tsvViewerLogic.transform('a\nx\ty\tz');
    const lines = out.split('\n');
    // colCount = 3; widths col0=1,col1=1,col2=1. header had 1 cell -> two trailing empties padded to width 1.
    expect(lines[0]).toBe('a |   |  ');
    expect(lines[2]).toBe('x | y | z');
  });

  // --- whitespace / trimming ---

  it('trims leading and trailing whitespace of the whole input', () => {
    const out = tsvViewerLogic.transform('\n\n  a\tb  \n');
    // input.trim() strips outer whitespace; first token line is 'a\tb' (with trailing spaces inside cell preserved by trim of whole only)
    expect(out).toContain('a');
    expect(out).toContain('b');
  });

  it('skips empty lines in the middle of the data', () => {
    const out = tsvViewerLogic.transform('a\tb\n\n1\t2\n\n3\t4');
    const lines = out.split('\n');
    // empty lines skipped -> header + sep + 2 data rows
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('a | b');
    expect(lines[2]).toBe('1 | 2');
    expect(lines[3]).toBe('3 | 4');
  });

  // --- unicode / emoji ---

  it('handles unicode and emoji content (JS string length based widths)', () => {
    const out = tsvViewerLogic.transform('café\tx\nüñ\t😀');
    expect(out).toContain('café');
    expect(out).toContain('😀');
    // header and data rows are present, separator in the middle
    const lines = out.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('+');
  });

  // --- large input ---

  it('handles a large number of rows', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => `k${i}\tv${i}`);
    const input = ['key\tval', ...rows].join('\n');
    const out = tsvViewerLogic.transform(input);
    const lines = out.split('\n');
    // header + separator + 1000 data rows
    expect(lines).toHaveLength(1002);
    // col0 width = max(len('key'), len('k999')) = 4; col1 width = max(len('val'), len('v999')) = 4
    expect(lines[0]).toBe('key  | val ');
    expect(lines[lines.length - 1]).toBe('k999 | v999');
  });

  // --- boundaries ---

  it('treats a single value with no tab/newline as one header cell', () => {
    const out = tsvViewerLogic.transform('hello');
    const lines = out.split('\n');
    expect(lines[0]).toBe('hello');
    expect(lines[1]).toBe('-----');
    expect(lines).toHaveLength(2);
  });

  it('pads numeric-looking values as plain strings', () => {
    const out = tsvViewerLogic.transform('id\tscore\n7\t100');
    const lines = out.split('\n');
    // col0 width max(len('id'),len('7'))=2, col1 width max(len('score'),len('100'))=5
    expect(lines[0]).toBe('id | score');
    expect(lines[2]).toBe('7  | 100  ');
  });

  it('preserves a trailing space-padded alignment that is idempotent in structure', () => {
    // Running transform on output is not meaningful (it would re-parse pipes),
    // but the column count/structure must be stable for identical input.
    const input = 'a\tbb\n1\t2';
    const out1 = tsvViewerLogic.transform(input);
    const out2 = tsvViewerLogic.transform(input);
    expect(out1).toBe(out2);
  });

  it('throws when all lines are empty (no rows after skipEmptyLines)', () => {
    expect(() => tsvViewerLogic.transform('\n\n\n')).toThrow('No rows found.');
  });

  it('throws on whitespace-only input', () => {
    expect(() => tsvViewerLogic.transform('   \t  ')).toThrow();
  });
});

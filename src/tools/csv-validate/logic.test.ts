import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { csvValidateLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const run = (input: string) => csvValidateLogic.transform(input, ctx);

describe('csvValidateLogic', () => {
  it('reports rows and columns for valid CSV', () => {
    const out = run('a,b\n1,2');
    expect(out).toContain('✓');
    expect(out).toContain('Rows: 2');
    expect(out).toContain('Columns: 2');
  });

  it('reports single column', () => {
    const out = run('x\n1');
    expect(out).toContain('Columns: 1');
  });

  it('produces the exact valid summary format', () => {
    expect(run('a,b\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('works without a context argument (ctx is optional)', () => {
    expect(csvValidateLogic.transform('a,b\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('treats empty input as zero rows/columns rather than crashing', () => {
    expect(run('')).toBe('✓ Valid CSV.\nRows: 0\nColumns: 0');
  });

  it('treats whitespace-only input as empty after trimming', () => {
    expect(run('   \n  \t ')).toBe('✓ Valid CSV.\nRows: 0\nColumns: 0');
  });

  it('treats a lone newline as empty', () => {
    expect(run('\n')).toBe('✓ Valid CSV.\nRows: 0\nColumns: 0');
  });

  it('counts a single bare cell as one row, one column', () => {
    expect(run('hello')).toBe('✓ Valid CSV.\nRows: 1\nColumns: 1');
  });

  it('counts a single header-only row', () => {
    expect(run('a,b,c')).toBe('✓ Valid CSV.\nRows: 1\nColumns: 3');
  });

  it('reports an unterminated quote as a fatal error on the correct row', () => {
    expect(run('a,"b\n1,2')).toBe('✗ Quoted field unterminated (row 1)');
  });

  it('reports the row offset (1-based) for a later malformed row', () => {
    const out = run('a,b\n"x,y');
    expect(out).toMatch(/^✗ /);
    expect(out).toContain('Quoted field unterminated');
    expect(out).toContain('(row 2)');
  });

  it('accepts properly quoted fields containing the delimiter', () => {
    expect(run('"a,b",c\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('accepts quoted fields containing embedded newlines as one logical row', () => {
    expect(run('"line1\nline2",b\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('reports the widest row for ragged data (more cols in a later row)', () => {
    expect(run('a,b,c\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 3');
  });

  it('reports the widest row for ragged data (more cols in the first row)', () => {
    expect(run('a,b,c,d\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 4');
  });

  it('counts an empty trailing field from a trailing separator', () => {
    expect(run('a,b,\n1,2,3')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 3');
  });

  it('counts a row of only separators as that many columns', () => {
    expect(run(',,,')).toBe('✓ Valid CSV.\nRows: 1\nColumns: 4');
  });

  it('skips empty lines, including leading blank lines (after trim)', () => {
    expect(run('\n\na,b\n1,2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('auto-detects a semicolon delimiter', () => {
    expect(run('a;b;c\n1;2;3')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 3');
  });

  it('auto-detects a tab delimiter', () => {
    expect(run('a\tb\n1\t2')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('handles CRLF line endings and a trailing CRLF', () => {
    expect(run('a,b\r\n1,2\r\n')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('handles unicode and emoji content', () => {
    expect(run('naïve,emoji\n😀,café')).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });

  it('handles purely numeric data including boundary values', () => {
    expect(run('0,-1,2147483648\n-0,9999999999,3.14')).toBe(
      '✓ Valid CSV.\nRows: 2\nColumns: 3',
    );
  });

  it('handles a large input deterministically', () => {
    const big = 'a,b,c\n' + Array.from({ length: 1000 }, () => '1,2,3').join('\n');
    expect(run(big)).toBe('✓ Valid CSV.\nRows: 1001\nColumns: 3');
  });

  it('is deterministic / idempotent for the same input', () => {
    const input = 'a,b\n1,2\n3,4';
    expect(run(input)).toBe(run(input));
  });

  it('ignores extra option keys in the context', () => {
    const out = csvValidateLogic.transform('a,b\n1,2', {
      options: { unused: true, mode: 'whatever' },
      secondary: 'ignored',
    });
    expect(out).toBe('✓ Valid CSV.\nRows: 2\nColumns: 2');
  });
});

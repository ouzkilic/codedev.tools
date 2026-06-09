import { describe, it, expect } from 'vitest';
import { csvViewerLogic } from './logic';

describe('csvViewerLogic', () => {
  it('aligns header and data with separator', () => {
    const out = csvViewerLogic.transform('a,bb\n1,2');
    expect(out).toContain('a | bb');
    expect(out).toContain('1 | 2');
    const lines = out.split('\n');
    expect(lines[1]).toMatch(/^-+-\+--+$/);
  });

  it('pads columns to the widest cell', () => {
    const out = csvViewerLogic.transform('name,id\nalice,1');
    expect(out).toContain('name  | id');
    expect(out).toContain('alice | 1 ');
  });

  it('handles a single column', () => {
    const out = csvViewerLogic.transform('x\n12\n3');
    expect(out).toContain('x ');
    expect(out).toContain('12');
    expect(out.split('\n')[1]).toBe('--');
  });

  it('throws on empty input', () => {
    expect(() => csvViewerLogic.transform('')).toThrow();
  });

  // --- exact full-output assertions (verified against papaparse) ---

  it('produces exact output for a simple two-column table', () => {
    const out = csvViewerLogic.transform('a,bb\n1,2');
    expect(out).toBe('a | bb\n--+---\n1 | 2 ');
  });

  it('produces exact output when columns have differing widths', () => {
    const out = csvViewerLogic.transform('name,id\nalice,1');
    expect(out).toBe('name  | id\n------+---\nalice | 1 ');
  });

  it('produces exact output for a single-column multi-row table', () => {
    const out = csvViewerLogic.transform('x\n12\n3');
    expect(out).toBe('x \n--\n12\n3 ');
  });

  it('renders a single cell with only a separator row', () => {
    const out = csvViewerLogic.transform('hello');
    expect(out).toBe('hello\n-----');
    expect(out.split('\n')).toHaveLength(2);
  });

  // --- separator row structure ---

  it('inserts exactly one separator row directly after the first row', () => {
    const out = csvViewerLogic.transform('a,b\n1,2\n3,4\n5,6');
    const lines = out.split('\n');
    // header + separator + 3 data rows = 5 lines
    expect(lines).toHaveLength(5);
    expect(lines[1]).toMatch(/^[-+]+$/);
    // only the second line is a separator
    const sepCount = lines.filter((l) => /^[-+]+$/.test(l)).length;
    expect(sepCount).toBe(1);
  });

  it('builds the separator by joining dashes with -+- per column boundary', () => {
    const out = csvViewerLogic.transform('aa,bbb\n1,2');
    const sep = out.split('\n')[1];
    // col widths: 2 and 3 -> '--' + '-+-' + '---' = '---+----'
    expect(sep).toBe('---+----');
  });

  // --- ragged rows (rows with differing column counts) ---

  it('pads short rows out to the maximum column count', () => {
    const out = csvViewerLogic.transform('a,b,c\n1\n2,3');
    expect(out).toBe('a | b | c\n--+---+--\n1 |   |  \n2 | 3 |  ');
  });

  it('expands column count when a later row is the widest', () => {
    const out = csvViewerLogic.transform('a\n1,2,3');
    expect(out).toBe('a |   |  \n--+---+--\n1 | 2 | 3');
  });

  // --- quoting / escaping handled by papaparse ---

  it('keeps a quoted field containing a comma as one cell', () => {
    const out = csvViewerLogic.transform('"a,b",c\n1,2');
    expect(out).toBe('a,b | c\n----+--\n1   | 2');
    // exactly two columns despite the comma inside quotes
    expect(out.split('\n')[0].split(' | ')).toHaveLength(2);
  });

  it('handles a quoted field that spans an embedded newline', () => {
    const out = csvViewerLogic.transform('"line1\nline2",b\nx,y');
    // the embedded newline stays inside the cell, so the cell text contains it
    expect(out).toContain('line1\nline2');
    // the second column header value 'b' is rendered as the row's second cell
    expect(out).toContain('| b');
    // the data row x,y is rendered
    expect(out).toContain('x ');
    expect(out).toContain('| y');
  });

  // --- whitespace / trimming ---

  it('trims surrounding whitespace before parsing', () => {
    const out = csvViewerLogic.transform('  \n a,b\n1,2 \n  ');
    expect(out).toBe('a | b\n--+--\n1 | 2');
  });

  it('throws "No data to render" on whitespace-only input', () => {
    expect(() => csvViewerLogic.transform('   \n\t  \n')).toThrow('No data to render');
  });

  it('throws "No data to render" on empty input with explicit message', () => {
    expect(() => csvViewerLogic.transform('')).toThrow('No data to render');
  });

  // --- line ending normalization ---

  it('handles CRLF line endings identically to LF', () => {
    const crlf = csvViewerLogic.transform('a,b\r\n1,2');
    const lf = csvViewerLogic.transform('a,b\n1,2');
    expect(crlf).toBe(lf);
  });

  it('ignores a trailing newline (skipEmptyLines)', () => {
    const withTrailing = csvViewerLogic.transform('a,b\n1,2\n');
    const without = csvViewerLogic.transform('a,b\n1,2');
    expect(withTrailing).toBe(without);
  });

  it('skips blank lines in the middle of the data', () => {
    const out = csvViewerLogic.transform('a,b\n1,2\n\n3,4');
    expect(out).toBe('a | b\n--+--\n1 | 2\n3 | 4');
    // 4 lines: header, separator, two data rows (blank line skipped)
    expect(out.split('\n')).toHaveLength(4);
  });

  // --- numbers / boundary values stay as strings ---

  it('renders negative, zero, and large numbers as left-aligned strings', () => {
    const out = csvViewerLogic.transform('n\n-5\n0\n100');
    expect(out).toBe('n  \n---\n-5 \n0  \n100');
  });

  // --- empty cells ---

  it('renders empty leading cells as padded blanks', () => {
    const out = csvViewerLogic.transform(',b\n,2');
    expect(out).toBe(' | b\n-+--\n | 2');
  });

  it('renders empty trailing cells as padded blanks', () => {
    const out = csvViewerLogic.transform('a,\n1,');
    expect(out).toBe('a | \n--+-\n1 | ');
  });

  // --- unicode / emoji ---

  it('preserves unicode characters in cells', () => {
    const out = csvViewerLogic.transform('naïve,emoji\n😀,café');
    expect(out).toContain('naïve');
    expect(out).toContain('café');
    expect(out).toContain('😀');
  });

  it('pads based on JS string length (units), not grapheme width', () => {
    // 'ab' has length 2; '😀' has UTF-16 length 2 as well, so they pad equally
    const out = csvViewerLogic.transform('ab\n😀');
    const lines = out.split('\n');
    expect(lines[0]).toBe('ab');
    expect(lines[1]).toBe('--');
    expect(lines[2]).toBe('😀');
  });

  // --- error path ---

  it('throws on an unterminated quoted field', () => {
    expect(() => csvViewerLogic.transform('"abc\ndef')).toThrow('Quoted field unterminated');
  });

  // --- large input / determinism ---

  it('handles a large input without crashing and stays deterministic', () => {
    const rows = ['col1,col2,col3'];
    for (let i = 0; i < 1000; i++) rows.push(`${i},val${i},${i * 2}`);
    const input = rows.join('\n');
    const first = csvViewerLogic.transform(input);
    const second = csvViewerLogic.transform(input);
    expect(first).toBe(second);
    // 1 header + 1 separator + 1000 data rows
    expect(first.split('\n')).toHaveLength(1002);
    expect(first.split('\n')[0]).toContain('col1');
  });

  it('is idempotent in the sense of pure-function determinism', () => {
    const input = 'a,b\n1,2\n3,4';
    expect(csvViewerLogic.transform(input)).toBe(csvViewerLogic.transform(input));
  });

  // --- every output row has identical visual length (alignment guarantee) ---

  it('produces rows that are all the same character length when shapes match', () => {
    const out = csvViewerLogic.transform('aaa,b\nc,ddd');
    const lines = out.split('\n');
    const len = lines[0].length;
    for (const l of lines) {
      expect(l.length).toBe(len);
    }
  });
});

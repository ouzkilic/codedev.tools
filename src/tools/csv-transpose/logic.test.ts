import { describe, it, expect } from 'vitest';
import { csvTransposeLogic } from './logic';

const t = (input: string) => csvTransposeLogic.transform(input);

describe('csvTransposeLogic', () => {
  // --- existing assertions (kept) ---
  it('transposes a 2x2 matrix', () => {
    expect(t('a,b\n1,2')).toBe('a,1\nb,2');
  });

  it('transposes a 2x3 matrix', () => {
    expect(t('1,2,3\n4,5,6')).toBe('1,4\n2,5\n3,6');
  });

  it('pads ragged rows with empty strings', () => {
    expect(t('a,b,c\nd')).toBe('a,d\nb,\nc,');
  });

  it('handles a single column', () => {
    expect(t('x\ny\nz')).toBe('x,y,z');
  });

  it('throws on empty input', () => {
    expect(() => t('')).toThrow();
  });

  // --- error paths ---
  it('throws "No data to transpose" on whitespace-only input (empty lines skipped)', () => {
    // skipEmptyLines drops blank lines; a string of only newlines yields no rows.
    expect(() => t('\n\n\n')).toThrow('No data to transpose');
  });

  it('throws on input that is only empty lines', () => {
    expect(() => t('\n')).toThrow('No data to transpose');
  });

  // --- single cell ---
  it('returns the single cell unchanged for a 1x1 matrix', () => {
    expect(t('hello')).toBe('hello');
  });

  // --- single row becomes single column ---
  it('transposes a single row into a single column', () => {
    expect(t('a,b,c')).toBe('a\nb\nc');
  });

  // --- square 3x3 ---
  it('transposes a 3x3 matrix', () => {
    expect(t('1,2,3\n4,5,6\n7,8,9')).toBe('1,4,7\n2,5,8\n3,6,9');
  });

  // --- ragged: longer row is below a shorter row ---
  it('pads when first row is shorter than second row', () => {
    // rows: ['a'] , ['b','c'] -> width 2
    // col0: a,b ; col1: '',c
    expect(t('a\nb,c')).toBe('a,b\n,c');
  });

  // --- empty fields preserved within a row ---
  it('preserves empty fields between delimiters', () => {
    // rows: ['a','','c'], ['1','2','3']
    // transposed: a,1 / '',2 / c,3
    expect(t('a,,c\n1,2,3')).toBe('a,1\n,2\nc,3');
  });

  // --- trailing delimiter creates trailing empty field ---
  it('handles trailing delimiter as a trailing empty field', () => {
    // rows: ['a','b',''], ['1','2','3']
    expect(t('a,b,\n1,2,3')).toBe('a,1\nb,2\n,3');
  });

  it('handles leading delimiter as a leading empty field', () => {
    // rows: ['','a','b'], ['1','2','3']
    expect(t(',a,b\n1,2,3')).toBe(',1\na,2\nb,3');
  });

  // --- quoting behavior of Papa.unparse ---
  it('quotes a field that contains a comma after transposing', () => {
    // single row, single cell containing a comma -> quoted on output
    expect(t('"a,b"')).toBe('"a,b"');
  });

  it('preserves quoted values that span the matrix and re-quotes as needed', () => {
    // rows: ['x,y','z'] , ['p','q']
    // col0: 'x,y','p' -> quote first ; col1: 'z','q'
    expect(t('"x,y",z\np,q')).toBe('"x,y",p\nz,q');
  });

  it('escapes embedded double quotes per RFC 4180', () => {
    // input field: a"b  (papa parses "a""b" as a"b), output re-quotes & doubles
    expect(t('"a""b"')).toBe('"a""b"');
  });

  it('quotes fields containing newlines', () => {
    // a field with an embedded newline (quoted in input) stays a single cell
    const out = t('"line1\nline2",x');
    // single row of 2 cells -> single column of 2 rows
    expect(out).toBe('"line1\nline2"\nx');
  });

  // --- unicode / emoji ---
  it('handles unicode and emoji content', () => {
    expect(t('café,naïve\n🚀,日本')).toBe('café,🚀\nnaïve,日本');
  });

  // --- numbers / boundaries kept as strings ---
  it('treats all values as strings (no numeric coercion)', () => {
    expect(t('0,-1\n2.5,3')).toBe('0,2.5\n-1,3');
  });

  // --- CRLF normalization ---
  it('normalizes CRLF input and outputs LF only', () => {
    const out = t('a,b\r\n1,2');
    expect(out).toBe('a,1\nb,2');
    expect(out).not.toContain('\r');
  });

  // --- determinism ---
  it('is deterministic across repeated calls', () => {
    const input = 'a,b,c\nd,e,f\ng,h,i';
    expect(t(input)).toBe(t(input));
  });

  // --- involution: transpose twice yields original (for rectangular data) ---
  it('is an involution on a rectangular matrix (double transpose)', () => {
    const input = 'a,b,c\nd,e,f';
    expect(t(t(input))).toBe(input);
  });

  it('double transpose recovers a square matrix', () => {
    const input = '1,2,3\n4,5,6\n7,8,9';
    expect(t(t(input))).toBe(input);
  });

  // --- large input ---
  it('handles a large matrix correctly', () => {
    const cols = 50;
    const rowsN = 40;
    const lines: string[] = [];
    for (let r = 0; r < rowsN; r++) {
      const cells: string[] = [];
      for (let c = 0; c < cols; c++) cells.push(`r${r}c${c}`);
      lines.push(cells.join(','));
    }
    const out = t(lines.join('\n'));
    const outLines = out.split('\n');
    // transposed should have `cols` rows and `rowsN` columns
    expect(outLines.length).toBe(cols);
    expect(outLines[0].split(',').length).toBe(rowsN);
    // first transposed row = first cell of each original row
    expect(outLines[0]).toBe(
      Array.from({ length: rowsN }, (_, r) => `r${r}c0`).join(','),
    );
    // a middle cell: transposed[col][row] == original[row][col]
    expect(outLines[7].split(',')[12]).toBe('r12c7');
  });

  // --- trailing newline at end of input is skipped, not an extra column ---
  it('ignores a trailing newline in the input', () => {
    expect(t('a,b\n1,2\n')).toBe('a,1\nb,2');
  });
});

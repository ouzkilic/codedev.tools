import { describe, it, expect } from 'vitest';
import { csvTsvLogic } from './logic';

const csvToTsv = (s: string) => csvTsvLogic.transform(s, { options: { mode: 'csv-to-tsv' }, secondary: '' });
const tsvToCsv = (s: string) => csvTsvLogic.transform(s, { options: { mode: 'tsv-to-csv' }, secondary: '' });

describe('csvTsv', () => {
  it('exposes a mode option with the two expected choices', () => {
    expect(csvTsvLogic.options).toBeDefined();
    const mode = csvTsvLogic.options?.find((o) => o.key === 'mode');
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('csv-to-tsv');
    const values = mode?.choices?.map((c) => c.value);
    expect(values).toEqual(['csv-to-tsv', 'tsv-to-csv']);
  });

  it('converts CSV to TSV', () => {
    expect(csvToTsv('a,b\n1,2')).toBe('a\tb\n1\t2');
  });

  it('converts TSV to CSV', () => {
    expect(tsvToCsv('a\tb\n1\t2')).toBe('a,b\n1,2');
  });

  it('defaults to csv-to-tsv when no options are provided', () => {
    expect(csvTsvLogic.transform('a,b\n1,2')).toBe('a\tb\n1\t2');
  });

  it('defaults to csv-to-tsv when mode option is absent in ctx', () => {
    expect(csvTsvLogic.transform('a,b\n1,2', { options: {}, secondary: '' })).toBe('a\tb\n1\t2');
  });

  it('quotes CSV cells that contain the comma delimiter', () => {
    expect(tsvToCsv('a\tb\nx,y\t2')).toContain('"x,y"');
  });

  it('does not need to quote tab content when converting CSV to TSV', () => {
    // a comma cell becomes separate columns is not the case here; commas are the delimiter source
    const out = csvToTsv('"x,y",b\n1,2');
    // "x,y" is one CSV cell -> becomes a tab-separated cell; tab output needs no quoting for commas
    expect(out).toBe('x,y\tb\n1\t2');
  });

  it('trims leading and trailing whitespace from the whole input', () => {
    expect(csvToTsv('  \n a,b\n1,2 \n  ')).toBe('a\tb\n1\t2');
  });

  it('skips empty lines', () => {
    expect(csvToTsv('a,b\n\n1,2\n\n')).toBe('a\tb\n1\t2');
  });

  it('handles a single column (no delimiter present)', () => {
    expect(csvToTsv('a\nb\nc')).toBe('a\nb\nc');
  });

  it('handles a single cell', () => {
    expect(csvToTsv('hello')).toBe('hello');
    expect(tsvToCsv('hello')).toBe('hello');
  });

  it('preserves unicode and emoji content', () => {
    expect(csvToTsv('ñame,城市\n😀,Ünal')).toBe('ñame\t城市\n😀\tÜnal');
  });

  it('handles cells with internal spaces without quoting', () => {
    expect(csvToTsv('first name,last name\nJohn Doe,Smith Jr')).toBe('first name\tlast name\nJohn Doe\tSmith Jr');
  });

  it('quotes a CSV cell that contains a newline when round-tripping back to CSV', () => {
    // TSV cell containing a newline -> CSV must quote it
    const out = tsvToCsv('"line1\nline2"\tb');
    expect(out).toContain('"line1\nline2"');
  });

  it('normalizes CRLF output to LF', () => {
    const out = csvToTsv('a,b\r\n1,2');
    expect(out).not.toContain('\r');
    expect(out).toBe('a\tb\n1\t2');
  });

  it('round-trips CSV -> TSV -> CSV for simple data', () => {
    const original = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    const tsv = csvToTsv(original);
    expect(tsvToCsv(tsv)).toBe(original);
  });

  it('round-trips TSV -> CSV -> TSV for simple data', () => {
    const original = 'name\tage\nAlice\t30\nBob\t25';
    const csv = tsvToCsv(original);
    expect(csvToTsv(csv)).toBe(original);
  });

  it('re-parsing TSV output as CSV treats each row as one tab-containing cell and re-quotes it', () => {
    const once = csvToTsv('a,b\n1,2'); // 'a\tb\n1\t2'
    // feeding back through csvToTsv: comma delimiter sees no commas, so each line is one cell
    // containing a tab; unparse with tab delimiter must quote cells containing the delimiter.
    const twice = csvToTsv(once);
    expect(twice).toBe('"a\tb"\n"1\t2"');
  });

  it('handles ragged rows with differing column counts', () => {
    // papaparse pads/keeps as-is; unparse should still produce tab-separated rows
    const out = csvToTsv('a,b,c\n1,2');
    const lines = out.split('\n');
    expect(lines[0]).toBe('a\tb\tc');
    expect(lines[1]).toContain('1\t2');
  });

  it('preserves quoted commas inside a CSV cell when going to TSV', () => {
    const out = csvToTsv('"a,b",c\n1,2');
    expect(out).toBe('a,b\tc\n1\t2');
  });

  it('handles numeric boundary and negative/zero values as plain text', () => {
    const out = csvToTsv('-1,0,2147483647\n3.14,-0.0,1e10');
    expect(out).toBe('-1\t0\t2147483647\n3.14\t-0.0\t1e10');
  });

  it('handles a large input deterministically', () => {
    const rows = Array.from({ length: 500 }, (_, i) => `${i},val${i},${i * 2}`).join('\n');
    const input = `id,name,double\n${rows}`;
    const out = csvToTsv(input);
    const outLines = out.split('\n');
    expect(outLines).toHaveLength(501);
    expect(outLines[0]).toBe('id\tname\tdouble');
    expect(outLines[1]).toBe('0\tval0\t0');
    expect(outLines[500]).toBe('499\tval499\t998');
  });

  it('returns empty string for empty input', () => {
    expect(csvToTsv('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(csvToTsv('   \n\t  \n')).toBe('');
  });

  it('handles trailing delimiter producing an empty last cell', () => {
    const out = csvToTsv('a,b,\n1,2,');
    expect(out).toBe('a\tb\t\n1\t2\t');
  });

  it('handles leading delimiter producing an empty first cell', () => {
    const out = csvToTsv(',a,b\n,1,2');
    expect(out).toBe('\ta\tb\n\t1\t2');
  });

  it('escapes double quotes inside a CSV cell on round-trip', () => {
    const original = '"she said ""hi""",x\n1,2';
    const tsv = csvToTsv(original);
    // the cell content is `she said "hi"`; since it contains quotes, unparse quotes & escapes it
    expect(tsv).toBe('"she said ""hi"""\tx\n1\t2');
    // back to CSV re-quotes/escapes the quotes as well
    expect(tsvToCsv(tsv)).toContain('"she said ""hi"""');
  });

  it('TSV to CSV does not split on commas (only tabs are delimiters)', () => {
    const out = tsvToCsv('a,b,c\t2');
    // "a,b,c" is one TSV cell containing commas -> must be quoted in CSV
    expect(out).toBe('"a,b,c",2');
  });
});

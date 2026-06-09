import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { excelToCsv } from './logic';

function makeWorkbook(rows: unknown[][], sheetName = 'Sheet1'): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sheetName);
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

function makeMultiSheetWorkbook(sheets: [string, unknown[][]][]): Uint8Array {
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of sheets) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
  }
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

describe('excelToCsv', () => {
  it('converts the first sheet to CSV', async () => {
    const buf = makeWorkbook([['name', 'age'], ['Ada', 36], ['Bob', 40]]);
    expect(await excelToCsv(buf)).toBe('name,age\nAda,36\nBob,40');
  });

  it('handles a single column', async () => {
    const buf = makeWorkbook([['x'], [1], [2]]);
    expect(await excelToCsv(buf)).toBe('x\n1\n2');
  });

  it('converts a single cell workbook', async () => {
    const buf = makeWorkbook([['only']]);
    expect(await excelToCsv(buf)).toBe('only');
  });

  it('accepts a raw ArrayBuffer (not just Uint8Array)', async () => {
    const u8 = makeWorkbook([['a', 'b'], ['1', '2']]);
    // makeWorkbook actually returns an ArrayBuffer from XLSX.write; normalise then
    // pass a guaranteed ArrayBuffer to exercise that branch of the union type.
    const bytes = new Uint8Array(u8 as unknown as ArrayBuffer);
    const ab: ArrayBuffer = bytes.buffer;
    expect(await excelToCsv(ab)).toBe('a,b\n1,2');
  });

  it('selects the FIRST sheet when multiple sheets exist', async () => {
    const buf = makeMultiSheetWorkbook([
      ['First', [['a'], ['1']]],
      ['Second', [['b'], ['2']]],
    ]);
    // First sheet content only — second sheet must be ignored.
    expect(await excelToCsv(buf)).toBe('a\n1');
  });

  it('quotes values containing commas', async () => {
    const buf = makeWorkbook([['a,b', 'c']]);
    expect(await excelToCsv(buf)).toBe('"a,b",c');
  });

  it('escapes embedded double quotes by doubling them', async () => {
    const buf = makeWorkbook([['he said "hi"', 'x']]);
    expect(await excelToCsv(buf)).toBe('"he said ""hi""",x');
  });

  it('quotes values containing newlines but preserves the inner newline', async () => {
    const buf = makeWorkbook([['line1\nline2', 'x']]);
    expect(await excelToCsv(buf)).toBe('"line1\nline2",x');
  });

  it('preserves unicode and emoji without quoting', async () => {
    const buf = makeWorkbook([['😀', 'é']]);
    expect(await excelToCsv(buf)).toBe('😀,é');
  });

  it('renders booleans as uppercase TRUE/FALSE', async () => {
    const buf = makeWorkbook([[true, false]]);
    expect(await excelToCsv(buf)).toBe('TRUE,FALSE');
  });

  it('handles negative, zero and fractional numbers', async () => {
    const buf = makeWorkbook([[-1, 0, 3.14]]);
    expect(await excelToCsv(buf)).toBe('-1,0,3.14');
  });

  it('keeps interior empty cells as empty fields', async () => {
    const buf = makeWorkbook([['a', '', 'c']]);
    expect(await excelToCsv(buf)).toBe('a,,c');
  });

  it('preserves leading and trailing spaces inside cells', async () => {
    const buf = makeWorkbook([[' a', 'b ']]);
    expect(await excelToCsv(buf)).toBe(' a,b ');
  });

  it('keeps numeric-looking strings verbatim (no numeric coercion of "007")', async () => {
    const buf = makeWorkbook([['007']]);
    expect(await excelToCsv(buf)).toBe('007');
  });

  it('pads ragged rows so every row has the same column count', async () => {
    const buf = makeWorkbook([['a', 'b', 'c'], ['x']]);
    expect(await excelToCsv(buf)).toBe('a,b,c\nx,,');
  });

  it('returns an empty string for an empty buffer (no sheets to read)', async () => {
    // XLSX.read on empty bytes yields no usable sheet content -> empty CSV.
    expect(await excelToCsv(new Uint8Array([]))).toBe('');
  });

  it('returns an empty string for a sheet with no rows', async () => {
    const buf = makeMultiSheetWorkbook([['S', []]]);
    expect(await excelToCsv(buf)).toBe('');
  });

  it('is deterministic: same input yields identical output across calls', async () => {
    const buf = makeWorkbook([['k', 'v'], ['one', 1], ['two', 2]]);
    const first = await excelToCsv(buf);
    const second = await excelToCsv(buf);
    expect(second).toBe(first);
    expect(first).toBe('k,v\none,1\ntwo,2');
  });

  it('round-trips a CSV through Excel and back to the same CSV', async () => {
    const original = 'name,age\nAda,36\nBob,40';
    const sheet = XLSX.utils.aoa_to_sheet([
      ['name', 'age'],
      ['Ada', 36],
      ['Bob', 40],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
    expect(await excelToCsv(buf)).toBe(original);
  });

  it('handles a large workbook with many rows', async () => {
    const rows: unknown[][] = [];
    for (let i = 0; i < 2000; i++) rows.push([i, `row${i}`]);
    const buf = makeWorkbook(rows);
    const out = await excelToCsv(buf);
    const lines = out.split('\n');
    expect(lines).toHaveLength(2000);
    expect(lines[0]).toBe('0,row0');
    expect(lines[lines.length - 1]).toBe('1999,row1999');
  });

  it('does not append a trailing newline after the last row', async () => {
    const buf = makeWorkbook([['a'], ['b']]);
    const out = await excelToCsv(buf);
    expect(out.endsWith('\n')).toBe(false);
    expect(out).toBe('a\nb');
  });

  it('produces output that parses back into the same matrix', async () => {
    const matrix = [
      ['h1', 'h2'],
      ['v1', 'with,comma'],
      ['quote"d', 'plain'],
    ];
    const buf = makeWorkbook(matrix);
    const csv = await excelToCsv(buf);
    const reparsed = XLSX.utils.sheet_to_json<string[]>(
      XLSX.read(csv, { type: 'string' }).Sheets.Sheet1,
      { header: 1 },
    );
    expect(reparsed).toEqual(matrix);
  });
});

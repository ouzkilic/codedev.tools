import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { excelToJson } from './logic';

// XLSX.write({ type: 'array' }) actually returns an ArrayBuffer in this build;
// the existing helper casts it to Uint8Array, which is fine because excelToJson
// accepts ArrayBuffer | Uint8Array. We keep the same convention as the original test.
function makeWorkbook(rows: unknown[][]): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

function makeMultiSheet(
  sheets: { name: string; rows: unknown[][] }[],
): Uint8Array {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s.rows), s.name);
  }
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

describe('excelToJson', () => {
  it('converts rows to an array of objects using the header', async () => {
    const buf = makeWorkbook([
      ['name', 'age'],
      ['Ada', 36],
      ['Bob', 40],
    ]);
    expect(JSON.parse(await excelToJson(buf))).toEqual([
      { name: 'Ada', age: 36 },
      { name: 'Bob', age: 40 },
    ]);
  });

  it('returns a 2-space pretty-printed JSON string', async () => {
    const buf = makeWorkbook([
      ['a', 'b'],
      [1, 2],
    ]);
    const out = await excelToJson(buf);
    expect(typeof out).toBe('string');
    // Pretty printed: contains a newline + two-space indentation.
    expect(out).toContain('\n');
    expect(out).toMatch(/\n {2}\{/);
    // Round-trip: parse back to the expected structure.
    expect(JSON.parse(out)).toEqual([{ a: 1, b: 2 }]);
    // Deterministic & idempotent for the same buffer.
    expect(await excelToJson(buf)).toBe(out);
  });

  it('accepts a Uint8Array buffer explicitly', async () => {
    const u8 = new Uint8Array(
      makeWorkbook([
        ['x'],
        [1],
      ]),
    );
    expect(JSON.parse(await excelToJson(u8))).toEqual([{ x: 1 }]);
  });

  it('accepts a true ArrayBuffer', async () => {
    const u8 = new Uint8Array(
      makeWorkbook([
        ['x'],
        [42],
      ]),
    );
    const ab = u8.buffer.slice(0);
    expect(JSON.parse(await excelToJson(ab))).toEqual([{ x: 42 }]);
  });

  it('reads only the first sheet of a multi-sheet workbook', async () => {
    const buf = makeMultiSheet([
      { name: 'First', rows: [['x'], [1]] },
      { name: 'Second', rows: [['y'], [2]] },
    ]);
    expect(JSON.parse(await excelToJson(buf))).toEqual([{ x: 1 }]);
  });

  it('returns an empty array for a header-only sheet (no data rows)', async () => {
    const buf = makeWorkbook([['a', 'b', 'c']]);
    expect(JSON.parse(await excelToJson(buf))).toEqual([]);
  });

  it('returns an empty array for an empty buffer (no usable content)', async () => {
    // SheetJS produces a default "Sheet1" with no rows -> [].
    expect(JSON.parse(await excelToJson(new Uint8Array(0)))).toEqual([]);
  });

  it('disambiguates duplicate header names by suffixing', async () => {
    const buf = makeWorkbook([
      ['a', 'a'],
      [1, 2],
    ]);
    // SheetJS renames the second "a" header to "a_1".
    expect(JSON.parse(await excelToJson(buf))).toEqual([{ a: 1, a_1: 2 }]);
  });

  it('omits keys for empty/blank cells (sparse rows)', async () => {
    const buf = makeWorkbook([
      ['a', 'b', 'c'],
      [1, null, 3],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toEqual([{ a: 1, c: 3 }]);
    expect(result[0]).not.toHaveProperty('b');
  });

  it('preserves number types including zero, negatives and decimals', async () => {
    const buf = makeWorkbook([
      ['n'],
      [0],
      [-5],
      [3.14],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toEqual([{ n: 0 }, { n: -5 }, { n: 3.14 }]);
    expect(typeof result[0].n).toBe('number');
  });

  it('preserves large numeric boundary values', async () => {
    const buf = makeWorkbook([
      ['big'],
      [1e21],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result[0].big).toBe(1e21);
  });

  it('preserves boolean values', async () => {
    const buf = makeWorkbook([
      ['flag'],
      [true],
      [false],
    ]);
    expect(JSON.parse(await excelToJson(buf))).toEqual([
      { flag: true },
      { flag: false },
    ]);
  });

  it('handles unicode, accented characters and emoji in headers and values', async () => {
    const buf = makeWorkbook([
      ['ünïcode', 'emoji'],
      ['çığ ş', '😀🎉'],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toEqual([{ 'ünïcode': 'çığ ş', emoji: '😀🎉' }]);
  });

  it('handles special characters: quotes and newlines inside cells', async () => {
    const buf = makeWorkbook([
      ['q', 'multi'],
      ['"quote"', 'line\nbreak'],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toEqual([{ q: '"quote"', multi: 'line\nbreak' }]);
  });

  it('handles whitespace-only string cells without trimming them', async () => {
    const buf = makeWorkbook([
      ['s'],
      ['   '],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toEqual([{ s: '   ' }]);
  });

  it('handles a large workbook (500 data rows) preserving order and count', async () => {
    const rows: unknown[][] = [['id', 'v']];
    for (let i = 0; i < 500; i++) rows.push([i, 'r' + i]);
    const buf = makeWorkbook(rows);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toHaveLength(500);
    expect(result[0]).toEqual({ id: 0, v: 'r0' });
    expect(result[499]).toEqual({ id: 499, v: 'r499' });
  });

  it('keeps rows mixing strings and numbers in the same column', async () => {
    const buf = makeWorkbook([
      ['val'],
      [1],
      ['two'],
      [3],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toEqual([{ val: 1 }, { val: 'two' }, { val: 3 }]);
  });

  it('produces output whose row count matches the data rows', async () => {
    const buf = makeWorkbook([
      ['h'],
      ['a'],
      ['b'],
      ['c'],
      ['d'],
    ]);
    const result = JSON.parse(await excelToJson(buf));
    expect(result).toHaveLength(4);
  });
});

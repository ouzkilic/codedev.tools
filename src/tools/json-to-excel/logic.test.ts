import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { jsonToXlsx } from './logic';

// jsonToXlsx returns an ArrayBuffer at runtime (XLSX.write type:'array').
type Bytes = Awaited<ReturnType<typeof jsonToXlsx>>;

// Helper: turn the produced bytes back into rows for round-trip assertions.
function readRows(bytes: Bytes): Record<string, unknown>[] {
  const wb = XLSX.read(bytes, { type: 'array' });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

function readWorkbook(bytes: Bytes) {
  return XLSX.read(bytes, { type: 'array' });
}

// View the raw bytes regardless of whether an ArrayBuffer or a typed array is returned.
function asU8(bytes: Bytes): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes as ArrayBuffer);
}

describe('jsonToXlsx', () => {
  it('round-trips a JSON array of objects through a workbook', async () => {
    const bytes = await jsonToXlsx('[{"name":"Ada","age":36},{"name":"Bob","age":40}]');
    expect(readRows(bytes)).toEqual([
      { name: 'Ada', age: 36 },
      { name: 'Bob', age: 40 },
    ]);
  });

  it('returns non-empty binary output', async () => {
    const bytes = await jsonToXlsx('[{"a":1}]');
    const u8 = asU8(bytes);
    expect(u8.byteLength).toBeGreaterThan(0);
  });

  it('produces a valid xlsx (zip) signature "PK"', async () => {
    const bytes = await jsonToXlsx('[{"a":1}]');
    const u8 = asU8(bytes);
    // xlsx is a zip archive -> starts with 0x50 0x4B ("PK")
    expect(u8[0]).toBe(0x50);
    expect(u8[1]).toBe(0x4b);
  });

  it('names the single sheet "Sheet1"', async () => {
    const bytes = await jsonToXlsx('[{"a":1}]');
    const wb = readWorkbook(bytes);
    expect(wb.SheetNames).toEqual(['Sheet1']);
  });

  it('uses the first row keys as column headers', async () => {
    const bytes = await jsonToXlsx('[{"name":"Ada","age":36}]');
    const wb = readWorkbook(bytes);
    const ws = wb.Sheets['Sheet1'];
    expect(ws['A1'].v).toBe('name');
    expect(ws['B1'].v).toBe('age');
  });

  it('preserves numeric values including zero and negatives', async () => {
    const bytes = await jsonToXlsx('[{"n":0},{"n":-12.5},{"n":1000000}]');
    expect(readRows(bytes)).toEqual([{ n: 0 }, { n: -12.5 }, { n: 1000000 }]);
  });

  it('preserves boolean values', async () => {
    const bytes = await jsonToXlsx('[{"flag":true},{"flag":false}]');
    const rows = readRows(bytes);
    expect(rows[0].flag).toBe(true);
    expect(rows[1].flag).toBe(false);
  });

  it('preserves unicode and emoji string content', async () => {
    const input = JSON.stringify([{ text: 'çığ — 日本語 😀' }]);
    const bytes = await jsonToXlsx(input);
    const rows = readRows(bytes);
    expect(rows[0].text).toBe('çığ — 日本語 😀');
  });

  it('preserves special characters such as quotes, commas and newlines', async () => {
    const input = JSON.stringify([{ s: 'a,"b"\nc\td' }]);
    const bytes = await jsonToXlsx(input);
    const rows = readRows(bytes);
    expect(rows[0].s).toBe('a,"b"\nc\td');
  });

  it('handles an empty array (no data rows)', async () => {
    const bytes = await jsonToXlsx('[]');
    expect(asU8(bytes).byteLength).toBeGreaterThan(0);
    expect(readRows(bytes)).toEqual([]);
  });

  it('handles rows with differing/sparse keys (union of columns)', async () => {
    const bytes = await jsonToXlsx('[{"a":1},{"b":2}]');
    const rows = readRows(bytes);
    // sheet_to_json omits cells that have no value, so missing keys simply absent
    expect(rows).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('keeps row order', async () => {
    const bytes = await jsonToXlsx('[{"i":1},{"i":2},{"i":3},{"i":4}]');
    const rows = readRows(bytes);
    expect(rows.map((r) => r.i)).toEqual([1, 2, 3, 4]);
  });

  it('handles a large input array', async () => {
    const big = Array.from({ length: 2000 }, (_, i) => ({ id: i, label: `row-${i}` }));
    const bytes = await jsonToXlsx(JSON.stringify(big));
    const rows = readRows(bytes);
    expect(rows.length).toBe(2000);
    expect(rows[0]).toEqual({ id: 0, label: 'row-0' });
    expect(rows[1999]).toEqual({ id: 1999, label: 'row-1999' });
  });

  it('is deterministic: same input yields byte-identical output', async () => {
    const input = '[{"name":"Ada","age":36},{"name":"Bob","age":40}]';
    const a = await jsonToXlsx(input);
    const b = await jsonToXlsx(input);
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it('serializes an array of primitives without throwing', async () => {
    // json_to_sheet accepts an array of primitives; assert it produces a real sheet.
    const bytes = await jsonToXlsx('[1,2,3]');
    const wb = readWorkbook(bytes);
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1'], { header: 1 }) as unknown[][];
    expect(aoa.length).toBeGreaterThanOrEqual(3);
  });

  it('throws when input is a JSON object, not an array', async () => {
    await expect(jsonToXlsx('{"a":1}')).rejects.toThrow(/array/i);
  });

  it('throws when input is a JSON number (not an array)', async () => {
    await expect(jsonToXlsx('42')).rejects.toThrow(/array/i);
  });

  it('throws when input is a JSON string literal (not an array)', async () => {
    await expect(jsonToXlsx('"hello"')).rejects.toThrow(/array/i);
  });

  it('throws when input is JSON null (not an array)', async () => {
    await expect(jsonToXlsx('null')).rejects.toThrow(/array/i);
  });

  it('throws on malformed JSON', async () => {
    await expect(jsonToXlsx('{bad json')).rejects.toThrow();
  });

  it('throws on an empty string (invalid JSON)', async () => {
    await expect(jsonToXlsx('')).rejects.toThrow();
  });

  it('throws on whitespace-only input (invalid JSON)', async () => {
    await expect(jsonToXlsx('   \n\t ')).rejects.toThrow();
  });

  it('throws on a trailing comma (invalid JSON)', async () => {
    await expect(jsonToXlsx('[{"a":1},]')).rejects.toThrow();
  });

  it('tolerates surrounding whitespace around valid JSON', async () => {
    const bytes = await jsonToXlsx('   [{"a":1}]   ');
    expect(readRows(bytes)).toEqual([{ a: 1 }]);
  });
});

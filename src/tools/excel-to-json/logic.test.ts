import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { excelToJson } from './logic';

function makeWorkbook(rows: unknown[][]): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

describe('excelToJson', () => {
  it('converts rows to an array of objects using the header', async () => {
    const buf = makeWorkbook([['name', 'age'], ['Ada', 36], ['Bob', 40]]);
    expect(JSON.parse(await excelToJson(buf))).toEqual([
      { name: 'Ada', age: 36 },
      { name: 'Bob', age: 40 },
    ]);
  });
});

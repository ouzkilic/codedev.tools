import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { excelToCsv } from './logic';

function makeWorkbook(rows: unknown[][]): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
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
});

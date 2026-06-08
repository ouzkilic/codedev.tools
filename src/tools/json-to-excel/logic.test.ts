import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { jsonToXlsx } from './logic';

describe('jsonToExcel', () => {
  it('round-trips a JSON array through a workbook', async () => {
    const bytes = await jsonToXlsx('[{"name":"Ada","age":36},{"name":"Bob","age":40}]');
    const wb = XLSX.read(bytes, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    expect(rows).toEqual([{ name: 'Ada', age: 36 }, { name: 'Bob', age: 40 }]);
  });
  it('throws when input is not an array', async () => {
    await expect(jsonToXlsx('{"a":1}')).rejects.toThrow(/array/i);
  });
});

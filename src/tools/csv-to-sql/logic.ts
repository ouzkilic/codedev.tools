import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

function sqlValue(v: unknown): string {
  if (v === null || v === '') return 'NULL';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

export const csvToSqlLogic: ToolLogic = {
  options: [
    { key: 'table', label: 'Table name', type: 'text', default: 'my_table', placeholder: 'my_table' },
  ],
  transform(input, ctx) {
    const table = String(ctx?.options.table ?? 'my_table').trim() || 'my_table';
    const result = Papa.parse<Record<string, unknown>>(input.trim(), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) throw new Error(fatal[0].message);
    if (result.data.length === 0) throw new Error('No data rows found.');

    const columns = result.meta.fields ?? [];
    const colList = columns.map((c) => `"${c}"`).join(', ');
    return result.data
      .map((row) => {
        const values = columns.map((c) => sqlValue(row[c])).join(', ');
        return `INSERT INTO ${table} (${colList}) VALUES (${values});`;
      })
      .join('\n');
  },
};

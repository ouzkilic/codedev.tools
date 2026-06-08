import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

export const tsvViewerLogic: ToolLogic = {
  transform(input: string): string {
    const result = Papa.parse<string[]>(input.trim(), { delimiter: '\t', skipEmptyLines: true });
    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) throw new Error(fatal[0].message);

    const rows = result.data;
    if (rows.length === 0) throw new Error('No rows found.');

    const colCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const widths: number[] = [];
    for (let c = 0; c < colCount; c++) {
      let w = 0;
      for (const row of rows) w = Math.max(w, String(row[c] ?? '').length);
      widths[c] = w;
    }

    const formatRow = (row: string[]): string =>
      widths.map((w, c) => String(row[c] ?? '').padEnd(w)).join(' | ');

    const separator = widths.map((w) => '-'.repeat(w)).join('-+-');

    const lines = [formatRow(rows[0]), separator, ...rows.slice(1).map(formatRow)];
    return lines.join('\n');
  },
};

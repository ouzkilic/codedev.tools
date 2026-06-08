import type { ToolLogic } from '@/hooks/useToolState';
import Papa from 'papaparse';

export const csvViewerLogic: ToolLogic = {
  transform(input: string): string {
    const r = Papa.parse(input.trim(), { skipEmptyLines: true });
    const fatal = r.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) {
      throw new Error(fatal[0].message);
    }
    const rows = r.data as string[][];
    if (rows.length === 0) {
      throw new Error('No data to render');
    }
    const colCount = rows.reduce((m, row) => Math.max(m, row.length), 0);
    const colWidths: number[] = [];
    for (let i = 0; i < colCount; i++) {
      colWidths[i] = rows.reduce((m, row) => Math.max(m, String(row[i] ?? '').length), 0);
    }
    const lines: string[] = [];
    rows.forEach((row, rowIndex) => {
      const cells: string[] = [];
      for (let i = 0; i < colCount; i++) {
        cells.push(String(row[i] ?? '').padEnd(colWidths[i]));
      }
      lines.push(cells.join(' | '));
      if (rowIndex === 0) {
        lines.push(colWidths.map((w) => '-'.repeat(w)).join('-+-'));
      }
    });
    return lines.join('\n');
  },
};

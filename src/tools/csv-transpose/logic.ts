import type { ToolLogic } from '@/hooks/useToolState';
import Papa from 'papaparse';

export const csvTransposeLogic: ToolLogic = {
  transform(input: string): string {
    const result = Papa.parse<string[]>(input, { skipEmptyLines: true });

    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) {
      throw new Error(fatal[0].message);
    }

    const rows = result.data;
    if (rows.length === 0) {
      throw new Error('No data to transpose');
    }

    const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const transposed: string[][] = [];
    for (let col = 0; col < width; col++) {
      const newRow: string[] = [];
      for (let r = 0; r < rows.length; r++) {
        newRow.push(rows[r][col] ?? '');
      }
      transposed.push(newRow);
    }

    return Papa.unparse(transposed).replace(/\r\n/g, '\n');
  },
};

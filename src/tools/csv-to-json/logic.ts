import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

export const csvToJsonLogic: ToolLogic = {
  transform(input: string): string {
    const result = Papa.parse(input.trim(), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // "1" -> 1, "true" -> true
    });
    // 'Delimiter' is a non-fatal auto-detection warning (e.g. single-column input); ignore it.
    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) {
      const e = fatal[0];
      throw new Error(`${e.message}${e.row !== undefined ? ` (row ${e.row + 1})` : ''}`);
    }
    return JSON.stringify(result.data, null, 2);
  },
};

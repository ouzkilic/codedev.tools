import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToCsvLogic: ToolLogic = {
  transform(input: string): string {
    const data = JSON.parse(input);
    if (!Array.isArray(data)) {
      throw new Error('Input must be a JSON array of objects.');
    }
    // Normalize CRLF to LF for consistent, cross-platform output.
    return Papa.unparse(data).replace(/\r\n/g, '\n');
  },
};

import type { ToolLogic } from '@/hooks/useToolState';
import Papa from 'papaparse';

export const csvValidateLogic: ToolLogic = {
  transform(input) {
    const r = Papa.parse<string[]>(input.trim(), { skipEmptyLines: true });
    const fatal = r.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length) {
      return (
        '✗ ' +
        fatal[0].message +
        (fatal[0].row !== undefined ? ' (row ' + (fatal[0].row + 1) + ')' : '')
      );
    }
    const rows = r.data;
    const cols = rows.reduce((m, row) => Math.max(m, row.length), 0);
    return '✓ Valid CSV.\nRows: ' + rows.length + '\nColumns: ' + cols;
  },
};

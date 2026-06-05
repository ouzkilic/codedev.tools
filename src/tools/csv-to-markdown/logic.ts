import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

export const csvToMarkdownLogic: ToolLogic = {
  transform(input: string): string {
    const result = Papa.parse<string[]>(input.trim(), { skipEmptyLines: true });
    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) throw new Error(fatal[0].message);

    const rows = result.data;
    if (rows.length === 0) throw new Error('No rows found.');

    const escapeCell = (c: string) => String(c ?? '').replace(/\|/g, '\\|');
    const header = rows[0].map(escapeCell);
    const lines = [
      `| ${header.join(' | ')} |`,
      `| ${header.map(() => '---').join(' | ')} |`,
      ...rows.slice(1).map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
    ];
    return lines.join('\n');
  },
};

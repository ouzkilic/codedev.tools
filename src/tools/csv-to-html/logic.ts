import type { ToolLogic } from '@/hooks/useToolState';
import Papa from 'papaparse';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const csvToHtmlLogic: ToolLogic = {
  transform(input: string): string {
    const r = Papa.parse(input.trim(), { skipEmptyLines: true });
    const fatal = r.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) {
      throw new Error(fatal[0].message);
    }
    const rows = r.data as string[][];
    if (rows.length === 0) {
      throw new Error('No data to convert');
    }
    const [header, ...body] = rows;
    const headCells = header.map((c) => '<th>' + escapeHtml(c) + '</th>').join('');
    const bodyRows = body
      .map((row) => '<tr>' + row.map((c) => '<td>' + escapeHtml(c) + '</td>').join('') + '</tr>')
      .join('\n    ');
    return (
      '<table>\n  <thead>\n    <tr>' +
      headCells +
      '</tr>\n  </thead>\n  <tbody>' +
      (bodyRows ? '\n    ' + bodyRows + '\n  ' : '') +
      '</tbody>\n</table>'
    );
  },
};

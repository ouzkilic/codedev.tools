import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toTag(name: string, index: number): string {
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
  return sanitized === '' ? `column_${index}` : sanitized;
}

export const csvToXmlLogic: ToolLogic = {
  transform(input: string): string {
    const result = Papa.parse<Record<string, string>>(input.trim(), {
      header: true,
      skipEmptyLines: true,
    });
    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) {
      const e = fatal[0];
      throw new Error(`${e.message}${e.row !== undefined ? ` (row ${e.row + 1})` : ''}`);
    }
    let out = '<rows>\n';
    for (const obj of result.data) {
      out += '  <row>\n';
      let index = 0;
      for (const [key, raw] of Object.entries(obj)) {
        const tag = toTag(key, index++);
        const value = raw == null ? '' : String(raw);
        out += '    <' + tag + '>' + escapeXml(value) + '</' + tag + '>\n';
      }
      out += '  </row>\n';
    }
    out += '</rows>';
    return out;
  },
};

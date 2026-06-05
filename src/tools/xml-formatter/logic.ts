import xmlFormat from 'xml-formatter';
import type { ToolLogic } from '@/hooks/useToolState';

export const xmlFormatterLogic: ToolLogic = {
  transform(input: string): string {
    // Throws on malformed XML — surfaced in the error banner.
    return xmlFormat(input, { collapseContent: true, indentation: '  ', lineSeparator: '\n' });
  },
};

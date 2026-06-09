import xmlFormat from 'xml-formatter';
import type { ToolLogic } from '@/hooks/useToolState';

export const xmlFormatterLogic: ToolLogic = {
  transform(input: string): string {
    // Throws on unparseable XML (surfaced in the error banner); note the library
    // also auto-corrects some recoverable issues (e.g. mismatched closing tags).
    return xmlFormat(input, { collapseContent: true, indentation: '  ', lineSeparator: '\n' });
  },
};

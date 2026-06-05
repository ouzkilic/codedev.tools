import xmlFormat from 'xml-formatter';
import type { ToolLogic } from '@/hooks/useToolState';

export const xmlMinifyLogic: ToolLogic = {
  transform(input: string): string {
    return xmlFormat.minify(input, { collapseContent: true });
  },
};

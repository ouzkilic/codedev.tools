import type { ToolLogic } from '@/hooks/useToolState';

export const cssMinifyLogic: ToolLogic = {
  transform(input: string): string {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  },
};

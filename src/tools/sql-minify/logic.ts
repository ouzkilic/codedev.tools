import type { ToolLogic } from '@/hooks/useToolState';

export const sqlMinifyLogic: ToolLogic = {
  transform(input: string): string {
    return input
      // Comments can separate tokens, so collapse them to a space; the \s+ pass
      // below removes any redundant whitespace this introduces.
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/--[^\n]*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },
};

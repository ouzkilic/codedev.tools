import type { ToolLogic } from '@/hooks/useToolState';

export const sqlMinifyLogic: ToolLogic = {
  transform(input: string): string {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/--[^\n]*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },
};

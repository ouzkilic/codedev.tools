import type { ToolLogic } from '@/hooks/useToolState';

export const jsonMinifyLogic: ToolLogic = {
  transform(input: string): string {
    // Parse then re-stringify with no spacing — also validates the input.
    return JSON.stringify(JSON.parse(input));
  },
};

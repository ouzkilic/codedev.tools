import type { ToolLogic } from '@/hooks/useToolState';

export const jsonFormatterLogic: ToolLogic = {
  transform(input: string): string {
    const parsed = JSON.parse(input); // useToolState catches errors
    return JSON.stringify(parsed, null, 2);
  },
};

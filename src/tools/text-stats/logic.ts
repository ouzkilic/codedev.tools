import type { ToolLogic } from '@/hooks/useToolState';

export const textStatsLogic: ToolLogic = {
  transform(input: string): string {
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const words = (input.match(/\S+/g) ?? []).length;
    const lines = input.split('\n').length;
    const bytes = new TextEncoder().encode(input).length;

    return [
      `Characters:           ${chars}`,
      `Characters (no space): ${charsNoSpaces}`,
      `Words:                ${words}`,
      `Lines:                ${lines}`,
      `Bytes (UTF-8):        ${bytes}`,
    ].join('\n');
  },
};

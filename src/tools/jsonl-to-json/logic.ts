import type { ToolLogic } from '@/hooks/useToolState';

export const jsonlToJsonLogic: ToolLogic = {
  transform(input: string): string {
    const lines = input.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const arr = lines.map((line, i) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON on line ${i + 1}.`);
      }
    });
    return JSON.stringify(arr, null, 2);
  },
};

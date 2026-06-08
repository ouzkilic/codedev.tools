import type { ToolLogic } from '@/hooks/useToolState';

export const propertiesToJsonLogic: ToolLogic = {
  transform(input: string): string {
    const obj: Record<string, string> = {};
    const lines = input.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '' || line.startsWith('#') || line.startsWith('!')) {
        continue;
      }
      const indices = [line.indexOf('='), line.indexOf(':')].filter((i) => i !== -1);
      if (indices.length === 0) {
        throw new Error(`Invalid property line (no separator): ${line}`);
      }
      const sepIndex = Math.min(...indices);
      const key = line.slice(0, sepIndex).trim();
      const value = line.slice(sepIndex + 1).trim();
      obj[key] = value;
    }
    return JSON.stringify(obj, null, 2);
  },
};

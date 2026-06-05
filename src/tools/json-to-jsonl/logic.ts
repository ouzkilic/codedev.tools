import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToJsonlLogic: ToolLogic = {
  transform(input: string): string {
    const data = JSON.parse(input);
    if (!Array.isArray(data)) {
      throw new Error('Input must be a JSON array (one line is emitted per element).');
    }
    // Each element becomes one compact JSON line (newline-delimited JSON / NDJSON).
    return data.map((item) => JSON.stringify(item)).join('\n');
  },
};

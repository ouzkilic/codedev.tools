import type { ToolLogic } from '@/hooks/useToolState';

export const httpHeadersLogic: ToolLogic = {
  transform(input: string): string {
    const lines = input
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const obj: Record<string, string> = {};
    for (const line of lines) {
      const i = line.indexOf(':');
      // skip request/status lines like 'GET / HTTP/1.1' (no colon, or colon at start)
      if (i < 1) continue;
      const key = line.slice(0, i).trim();
      const val = line.slice(i + 1).trim();
      obj[key] = val;
    }
    if (Object.keys(obj).length === 0) {
      throw new Error('No headers found.');
    }
    return JSON.stringify(obj, null, 2);
  },
};

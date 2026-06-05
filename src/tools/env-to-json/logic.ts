import type { ToolLogic } from '@/hooks/useToolState';

export const envToJsonLogic: ToolLogic = {
  transform(input: string): string {
    const obj: Record<string, string> = {};
    for (const line of input.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, '');
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      obj[key] = value;
    }
    return JSON.stringify(obj, null, 2);
  },
};

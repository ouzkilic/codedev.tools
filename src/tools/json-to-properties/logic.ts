import type { ToolLogic } from '@/hooks/useToolState';

function flatten(value: unknown, prefix: string, lines: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      flatten(item, prefix ? `${prefix}.${i}` : String(i), lines);
    });
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}.${key}` : key, lines);
    }
    return;
  }
  lines.push(`${prefix}=${String(value)}`);
}

export const jsonToPropertiesLogic: ToolLogic = {
  transform(input: string): string {
    let obj: unknown;
    try {
      obj = JSON.parse(input);
    } catch (e) {
      throw new Error('Invalid JSON input', { cause: e });
    }
    if (obj === null || Array.isArray(obj) || typeof obj !== 'object') {
      throw new Error('Input must be a JSON object');
    }
    const lines: string[] = [];
    flatten(obj, '', lines);
    return lines.join('\n');
  },
};

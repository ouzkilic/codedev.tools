import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToEnvLogic: ToolLogic = {
  transform(input: string): string {
    const obj = JSON.parse(input);
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error('Input must be a flat JSON object.');
    }
    return Object.entries(obj)
      .map(([key, value]) => {
        let v = value === null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (/[\s#"'=]/.test(v)) v = `"${v.replace(/"/g, '\\"')}"`;
        return `${key}=${v}`;
      })
      .join('\n');
  },
};

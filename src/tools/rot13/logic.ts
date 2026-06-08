import type { ToolLogic } from '@/hooks/useToolState';

export const rot13Logic: ToolLogic = {
  options: [
    { key: 'shift', label: 'Shift', type: 'text', placeholder: '13', default: '13' },
  ],
  transform(input: string, ctx?): string {
    const raw = parseInt(String(ctx?.options.shift ?? '13'), 10) || 13;
    const n = ((raw % 26) + 26) % 26;
    return input.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + n) % 26) + base);
    });
  },
};

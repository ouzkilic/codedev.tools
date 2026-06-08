import type { ToolLogic } from '@/hooks/useToolState';

export const ipConvertLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'to-int',
      choices: [
        { value: 'to-int', label: 'IP → Integer' },
        { value: 'to-ip', label: 'Integer → IP' },
      ],
    },
  ],
  transform(input, ctx) {
    const mode = String(ctx?.options.mode ?? 'to-int');
    if (mode === 'to-ip') {
      const n = Number(input.trim());
      if (!Number.isInteger(n) || n < 0 || n > 4294967295) throw new Error('Invalid integer.');
      return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    }
    const parts = input.trim().split('.');
    if (parts.length !== 4) throw new Error('Invalid IPv4 address.');
    const nums = parts.map((p) => {
      const n = Number(p);
      if (!Number.isInteger(n) || n < 0 || n > 255) throw new Error('Invalid octet: ' + p);
      return n;
    });
    return String((nums[0] * 16777216 + nums[1] * 65536 + nums[2] * 256 + nums[3]) >>> 0);
  },
};

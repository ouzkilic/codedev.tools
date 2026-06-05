import type { ToolLogic } from '@/hooks/useToolState';

export const dateDiffLogic: ToolLogic = {
  secondary: { label: 'End date', placeholder: '2024-12-31' },
  transform(input, ctx) {
    const start = new Date(input.trim());
    if (Number.isNaN(start.getTime())) throw new Error('Could not parse the start date.');
    const end = new Date((ctx?.secondary ?? '').trim());
    if (Number.isNaN(end.getTime())) throw new Error('Could not parse the end date.');

    const ms = Math.abs(end.getTime() - start.getTime());
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const round = (n: number) => parseFloat(n.toFixed(2));

    return [
      `Milliseconds: ${ms}`,
      `Seconds:      ${round(seconds)}`,
      `Minutes:      ${round(minutes)}`,
      `Hours:        ${round(hours)}`,
      `Days:         ${round(days)}`,
      `Weeks:        ${round(days / 7)}`,
    ].join('\n');
  },
};

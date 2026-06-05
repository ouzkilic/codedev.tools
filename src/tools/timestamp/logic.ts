import type { ToolLogic } from '@/hooks/useToolState';

function timestampToDate(raw: string): string {
  const num = Number(raw.trim());
  if (!Number.isFinite(num)) throw new Error('Enter a numeric Unix timestamp.');
  // Heuristic: values with 13+ digits (>= 1e12) are milliseconds, otherwise seconds.
  const ms = Math.abs(num) >= 1e12 ? num : num * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) throw new Error('Timestamp is out of range.');
  return [
    `ISO 8601:   ${d.toISOString()}`,
    `UTC:        ${d.toUTCString()}`,
    `Local:      ${d.toString()}`,
    `Unix (s):   ${Math.floor(d.getTime() / 1000)}`,
    `Unix (ms):  ${d.getTime()}`,
  ].join('\n');
}

function dateToTimestamp(raw: string): string {
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) throw new Error('Could not parse the date.');
  return [
    `Unix (s):   ${Math.floor(d.getTime() / 1000)}`,
    `Unix (ms):  ${d.getTime()}`,
    `ISO 8601:   ${d.toISOString()}`,
  ].join('\n');
}

export const timestampLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'to-date',
      choices: [
        { value: 'to-date', label: 'Timestamp → Date' },
        { value: 'to-timestamp', label: 'Date → Timestamp' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'to-date') === 'to-timestamp'
      ? dateToTimestamp(input)
      : timestampToDate(input);
  },
};

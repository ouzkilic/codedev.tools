import type { ToolLogic } from '@/hooks/useToolState';

export const timezoneLogic: ToolLogic = {
  options: [
    {
      key: 'tz',
      label: 'Timezone',
      type: 'select',
      choices: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'America/New_York' },
        { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
        { value: 'Europe/London', label: 'Europe/London' },
        { value: 'Europe/Istanbul', label: 'Europe/Istanbul' },
        { value: 'Europe/Paris', label: 'Europe/Paris' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
        { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney' },
      ],
      default: 'Europe/Istanbul',
    },
  ],
  transform(input, ctx) {
    const tz = String(ctx?.options.tz ?? 'Europe/Istanbul');
    const d = new Date(input.trim());
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date input');
    }
    const formatted = new Intl.DateTimeFormat('sv-SE', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
    return formatted + ' (' + tz + ')';
  },
};

import type { ToolLogic } from '@/hooks/useToolState';

const UNITS: { name: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { name: 'year', seconds: 31536000 },
  { name: 'month', seconds: 2592000 },
  { name: 'week', seconds: 604800 },
  { name: 'day', seconds: 86400 },
  { name: 'hour', seconds: 3600 },
  { name: 'minute', seconds: 60 },
  { name: 'second', seconds: 1 },
];

export function relativeTime(date: Date, now: Date): string {
  const diffSeconds = (date.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
  const abs = Math.abs(diffSeconds);
  const unit = UNITS.find((u) => abs >= u.seconds) ?? UNITS[UNITS.length - 1];
  return rtf.format(Math.round(diffSeconds / unit.seconds), unit.name);
}

export const relativeTimeLogic: ToolLogic = {
  transform(input) {
    const parsed = new Date(input.trim());
    if (Number.isNaN(parsed.getTime())) throw new Error('Could not parse the date.');
    const current = new Date();
    return relativeTime(parsed, current);
  },
};

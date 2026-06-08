import type { ToolLogic } from '@/hooks/useToolState';

const UNIT_SECONDS: Record<string, number> = {
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
};

function toHuman(input: string): string {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error('Input must be a non-negative integer number of seconds');
  }
  let total = Number(trimmed);
  if (!Number.isSafeInteger(total)) {
    throw new Error('Number of seconds is too large');
  }
  if (total === 0) {
    return '0s';
  }
  const parts: string[] = [];
  for (const unit of ['d', 'h', 'm', 's']) {
    const size = UNIT_SECONDS[unit];
    const value = Math.floor(total / size);
    if (value > 0) {
      parts.push(`${value}${unit}`);
      total -= value * size;
    }
  }
  return parts.join(' ');
}

function toSeconds(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Input must contain at least one duration token');
  }
  const tokens = trimmed.split(/\s+/);
  let total = 0;
  for (const token of tokens) {
    const match = /^(\d+)([dhms])$/.exec(token);
    if (!match) {
      throw new Error(`Invalid duration token: ${token}`);
    }
    total += Number(match[1]) * UNIT_SECONDS[match[2]];
  }
  return String(total);
}

export const durationFormatLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'to-human', label: 'Seconds to human' },
        { value: 'to-seconds', label: 'Human to seconds' },
      ],
      default: 'to-human',
    },
  ],
  transform(input, ctx) {
    const mode = String(ctx?.options.mode ?? 'to-human');
    if (mode === 'to-seconds') {
      return toSeconds(input);
    }
    return toHuman(input);
  },
};

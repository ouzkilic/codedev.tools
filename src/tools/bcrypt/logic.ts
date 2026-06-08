import bcrypt from 'bcryptjs';
import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

export const bcryptLogic: AsyncToolLogic = {
  secondary: { label: 'Hash to verify against', placeholder: '$2a$10$…' },
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'hash',
      choices: [
        { value: 'hash', label: 'Hash' },
        { value: 'verify', label: 'Verify' },
      ],
    },
    { key: 'rounds', label: 'Rounds', type: 'text', default: '10', placeholder: '10' },
  ],
  async transform(input, ctx) {
    const mode = String(ctx.options.mode ?? 'hash');
    if (mode === 'verify') {
      const ok = await bcrypt.compare(input, (ctx.secondary ?? '').trim());
      return ok ? '✓ Match' : '✗ No match';
    }
    const rounds = parseInt(String(ctx.options.rounds ?? '10'), 10) || 10;
    return bcrypt.hash(input, rounds);
  },
};

import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

export const pbkdf2Logic: AsyncToolLogic = {
  options: [
    { key: 'salt', label: 'Salt', type: 'text', default: 'salt', placeholder: 'salt' },
    { key: 'iterations', label: 'Iterations', type: 'text', default: '100000', placeholder: '100000' },
    {
      key: 'hash',
      label: 'Hash',
      type: 'select',
      default: 'SHA-256',
      choices: [
        { value: 'SHA-256', label: 'SHA-256' },
        { value: 'SHA-1', label: 'SHA-1' },
        { value: 'SHA-384', label: 'SHA-384' },
        { value: 'SHA-512', label: 'SHA-512' },
      ],
    },
    { key: 'keyBits', label: 'Key bits', type: 'text', default: '256', placeholder: '256' },
  ],
  async transform(input, ctx) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(input), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(String(ctx.options.salt ?? 'salt')),
        iterations: parseInt(String(ctx.options.iterations ?? '100000'), 10) || 1,
        hash: String(ctx.options.hash ?? 'SHA-256'),
      },
      key,
      parseInt(String(ctx.options.keyBits ?? '256'), 10) || 256,
    );
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

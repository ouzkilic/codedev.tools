import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmac(message: string, secret: string, algorithm: string): Promise<string> {
  const hash = (ALGOS as readonly string[]).includes(algorithm) ? algorithm : 'SHA-256';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toHex(signature);
}

export const hmacLogic: AsyncToolLogic = {
  secondary: { label: 'Secret key', placeholder: 'your-secret' },
  options: [
    {
      key: 'algorithm',
      label: 'Algorithm',
      type: 'select',
      default: 'SHA-256',
      choices: ALGOS.map((a) => ({ value: a, label: `HMAC-${a}` })),
    },
  ],
  transform(input, ctx) {
    return hmac(input, ctx.secondary, String(ctx.options.algorithm ?? 'SHA-256'));
  },
};

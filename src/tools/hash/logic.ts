import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashText(text: string, algorithm: string): Promise<string> {
  const algo = (ALGOS as readonly string[]).includes(algorithm) ? algorithm : 'SHA-256';
  const digest = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return toHex(digest);
}

export const hashLogic: AsyncToolLogic = {
  options: [
    {
      key: 'algorithm',
      label: 'Algorithm',
      type: 'select',
      default: 'SHA-256',
      choices: ALGOS.map((a) => ({ value: a, label: a })),
    },
  ],
  transform(input, ctx) {
    return hashText(input, String(ctx.options.algorithm ?? 'SHA-256'));
  },
};

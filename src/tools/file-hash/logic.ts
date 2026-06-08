const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

export async function hashBuffer(buffer: BufferSource, algorithm: string): Promise<string> {
  const algo = (ALGOS as readonly string[]).includes(algorithm) ? algorithm : 'SHA-256';
  const digest = await crypto.subtle.digest(algo, buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

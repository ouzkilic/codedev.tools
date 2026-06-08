import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

function toB64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function fromB64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(pass: string, salt: BufferSource): Promise<CryptoKey> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    k,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export const aesLogic: AsyncToolLogic = {
  secondary: { label: 'Passphrase', placeholder: 'your-passphrase' },
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encrypt',
      choices: [
        { value: 'encrypt', label: 'Encrypt' },
        { value: 'decrypt', label: 'Decrypt' },
      ],
    },
  ],
  async transform(input, ctx) {
    const pass = ctx.secondary;
    if (!pass) throw new Error('Enter a passphrase.');
    const mode = String(ctx.options.mode ?? 'encrypt');

    if (mode === 'decrypt') {
      const bytes = fromB64(input.trim());
      const salt = bytes.slice(0, 16);
      const iv = bytes.slice(16, 28);
      const ct = bytes.slice(28);
      const key = await deriveKey(pass, salt);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, ct as BufferSource);
      return new TextDecoder().decode(pt);
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pass, salt);
    const ct = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(input)),
    );
    const out = new Uint8Array(16 + 12 + ct.length);
    out.set(salt, 0);
    out.set(iv, 16);
    out.set(ct, 28);
    return toB64(out);
  },
};

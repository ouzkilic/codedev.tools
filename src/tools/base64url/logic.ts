import type { ToolLogic } from '@/hooks/useToolState';

function encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(input: string): string {
  const restored = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = restored + '='.repeat((4 - (restored.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(padded);
  } catch (e) {
    throw new Error('Invalid Base64URL input', { cause: e });
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export const base64urlLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
      default: 'encode',
    },
  ],
  transform(input, ctx) {
    const mode = String(ctx?.options.mode ?? 'encode');
    return mode === 'decode' ? decode(input) : encode(input);
  },
};

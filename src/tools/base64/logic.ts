import type { ToolLogic } from '@/hooks/useToolState';

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export const base64Logic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode (text → Base64)' },
        { value: 'decode', label: 'Decode (Base64 → text)' },
      ],
    },
  ],
  transform(input: string, ctx): string {
    return (ctx?.options.mode ?? 'encode') === 'decode'
      ? base64ToUtf8(input)
      : utf8ToBase64(input);
  },
};

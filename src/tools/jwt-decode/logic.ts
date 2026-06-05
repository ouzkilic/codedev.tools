import type { ToolLogic } from '@/hooks/useToolState';

function base64UrlDecode(part: string): string {
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export const jwtDecodeLogic: ToolLogic = {
  transform(input: string): string {
    const parts = input.trim().split('.');
    if (parts.length < 2) {
      throw new Error('Not a valid JWT (expected header.payload.signature).');
    }
    // Decode only — the signature is NOT verified (no secret/key involved).
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return JSON.stringify({ header, payload }, null, 2);
  },
};

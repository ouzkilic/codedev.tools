export interface DecodedFile {
  mime: string;
  bytes: Uint8Array;
}

function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Accepts a full data URI (data:<mime>;base64,<data>) or a bare base64 string.
export function parseDataUri(input: string): DecodedFile {
  const s = input.trim();
  const m = s.match(/^data:([^;,]*)(;base64)?,([\s\S]*)$/);
  if (m) {
    const mime = m[1] || 'application/octet-stream';
    const bytes = m[2]
      ? decodeBase64(m[3])
      : new TextEncoder().encode(decodeURIComponent(m[3]));
    return { mime, bytes };
  }
  return { mime: 'application/octet-stream', bytes: decodeBase64(s) };
}

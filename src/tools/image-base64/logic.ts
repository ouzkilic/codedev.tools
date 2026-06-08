export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function bufferToDataUri(buffer: ArrayBuffer | Uint8Array, mime: string): string {
  return `data:${mime || 'application/octet-stream'};base64,${bufferToBase64(buffer)}`;
}

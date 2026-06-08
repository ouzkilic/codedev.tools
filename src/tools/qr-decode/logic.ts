export function formatQrResult(text: string | null): string {
  return text ? text : 'No QR code found in the image.';
}

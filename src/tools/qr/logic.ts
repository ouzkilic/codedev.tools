// Heavy lib: dynamically imported so it only loads when this tool runs.
export async function generateQrDataUrl(text: string, ecc: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: (ecc as 'L' | 'M' | 'Q' | 'H') || 'M',
    margin: 2,
    width: 320,
  });
}

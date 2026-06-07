import { describe, it, expect } from 'vitest';
import { generateQrDataUrl } from './logic';

describe('qr', () => {
  it('produces a PNG data URL', async () => {
    const url = await generateQrDataUrl('https://codedev.tools', 'M');
    expect(url.startsWith('data:image/png;base64,')).toBe(true);
    expect(url.length).toBeGreaterThan(100);
  });
  it('produces different output for different content', async () => {
    const a = await generateQrDataUrl('a', 'M');
    const b = await generateQrDataUrl('b', 'M');
    expect(a).not.toBe(b);
  });
});

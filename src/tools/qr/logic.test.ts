import { describe, it, expect } from 'vitest';
import { generateQrDataUrl } from './logic';

const PNG_PREFIX = 'data:image/png;base64,';

describe('qr / generateQrDataUrl', () => {
  it('produces a PNG data URL', async () => {
    const url = await generateQrDataUrl('https://codedev.tools', 'M');
    expect(url.startsWith(PNG_PREFIX)).toBe(true);
    expect(url.length).toBeGreaterThan(100);
  });

  it('produces different output for different content', async () => {
    const a = await generateQrDataUrl('a', 'M');
    const b = await generateQrDataUrl('b', 'M');
    expect(a).not.toBe(b);
  });

  it('is deterministic: same input and ecc give identical output', async () => {
    const a = await generateQrDataUrl('determinism-check', 'M');
    const b = await generateQrDataUrl('determinism-check', 'M');
    expect(a).toBe(b);
  });

  it('emits valid base64 after the PNG prefix', async () => {
    const url = await generateQrDataUrl('base64-test', 'M');
    const payload = url.slice(PNG_PREFIX.length);
    expect(payload.length).toBeGreaterThan(0);
    expect(payload).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it('decoded PNG payload starts with the PNG magic signature', async () => {
    const url = await generateQrDataUrl('png-magic', 'M');
    const payload = url.slice(PNG_PREFIX.length);
    const bytes = atob(payload);
    // PNG magic: 0x89 'P' 'N' 'G'
    expect(bytes.charCodeAt(0)).toBe(0x89);
    expect(bytes.charCodeAt(1)).toBe('P'.charCodeAt(0));
    expect(bytes.charCodeAt(2)).toBe('N'.charCodeAt(0));
    expect(bytes.charCodeAt(3)).toBe('G'.charCodeAt(0));
  });

  describe('error correction levels', () => {
    for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
      it(`accepts ecc level "${ecc}" and returns a PNG data URL`, async () => {
        const url = await generateQrDataUrl('ecc-level-content', ecc);
        expect(url.startsWith(PNG_PREFIX)).toBe(true);
      });
    }

    it('produces different output for different ecc levels (H has more redundancy than L)', async () => {
      const low = await generateQrDataUrl('same-content-here', 'L');
      const high = await generateQrDataUrl('same-content-here', 'H');
      expect(low).not.toBe(high);
    });

    it('falls back to "M" when ecc is an empty string', async () => {
      const fallback = await generateQrDataUrl('fallback-content', '');
      const explicit = await generateQrDataUrl('fallback-content', 'M');
      expect(fallback).toBe(explicit);
    });
  });

  describe('content variations', () => {
    it('encodes a single character', async () => {
      const url = await generateQrDataUrl('x', 'M');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes whitespace-only input', async () => {
      const url = await generateQrDataUrl('   ', 'M');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes a numeric-only string', async () => {
      const url = await generateQrDataUrl('1234567890', 'M');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes special characters', async () => {
      const url = await generateQrDataUrl('!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~', 'M');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes unicode and emoji', async () => {
      const url = await generateQrDataUrl('héllo 世界 🚀✨', 'M');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes a newline-containing string', async () => {
      const url = await generateQrDataUrl('line1\nline2\r\nline3', 'M');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes leading/trailing whitespace distinctly from trimmed content', async () => {
      const padded = await generateQrDataUrl('  content  ', 'M');
      const trimmed = await generateQrDataUrl('content', 'M');
      expect(padded).not.toBe(trimmed);
    });

    it('encodes a long URL with query params', async () => {
      const url = await generateQrDataUrl(
        'https://example.com/path?a=1&b=2&c=hello%20world#section',
        'M',
      );
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
    });

    it('encodes a moderately large input at low ecc', async () => {
      const big = 'a'.repeat(1000);
      const url = await generateQrDataUrl(big, 'L');
      expect(url.startsWith(PNG_PREFIX)).toBe(true);
      expect(url.length).toBeGreaterThan(100);
    });
  });

  describe('error paths', () => {
    it('rejects when text is an empty string', async () => {
      await expect(generateQrDataUrl('', 'M')).rejects.toThrow();
    });

    it('rejects when input exceeds QR capacity (overflow)', async () => {
      // Far beyond the byte-mode capacity of even version 40 at ecc L (~2953 bytes).
      const tooBig = 'a'.repeat(10000);
      await expect(generateQrDataUrl(tooBig, 'H')).rejects.toThrow();
    });
  });
});

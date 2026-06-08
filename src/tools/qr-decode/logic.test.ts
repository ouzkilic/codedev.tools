import { describe, it, expect } from 'vitest';
import { formatQrResult } from './logic';

describe('formatQrResult', () => {
  it('returns the decoded text when non-empty', () => {
    expect(formatQrResult('https://x.com')).toBe('https://x.com');
  });

  it('returns a fallback message when text is null', () => {
    expect(formatQrResult(null)).toBe('No QR code found in the image.');
  });

  it('returns a fallback message when text is empty', () => {
    expect(formatQrResult('')).toBe('No QR code found in the image.');
  });
});

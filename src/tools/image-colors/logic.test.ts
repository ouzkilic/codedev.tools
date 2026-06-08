import { describe, it, expect } from 'vitest';
import { extractPalette } from './logic';

describe('extractPalette', () => {
  it('returns the most common color first and includes others', () => {
    // 2 red pixels + 1 blue pixel (RGBA)
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      255, 0, 0, 255,
      0, 0, 255, 255,
    ]);
    const palette = extractPalette(data, 2);
    // 255 quantizes to its high 4 bits (0xf0), so red -> '#f00000', blue -> '#0000f0'.
    expect(palette[0]).toBe('#f00000');
    expect(palette).toContain('#0000f0');
  });

  it('skips fully transparent pixels', () => {
    const data = new Uint8ClampedArray([
      0, 255, 0, 0, // transparent green — ignored
      255, 0, 0, 255,
    ]);
    const palette = extractPalette(data);
    expect(palette).toEqual(['#f00000']);
  });

  it('quantizes channels to their high 4 bits', () => {
    // 0x1F -> high nibble 0x10
    const data = new Uint8ClampedArray([0x1f, 0x2f, 0x3f, 255]);
    expect(extractPalette(data)).toEqual(['#102030']);
  });

  it('limits results to the requested count', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
    ]);
    expect(extractPalette(data, 2)).toHaveLength(2);
  });
});

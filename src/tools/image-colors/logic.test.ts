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

  it('returns an empty array for empty pixel data', () => {
    const data = new Uint8ClampedArray([]);
    expect(extractPalette(data)).toEqual([]);
  });

  it('returns an empty array when count is 0', () => {
    const data = new Uint8ClampedArray([255, 0, 0, 255]);
    expect(extractPalette(data, 0)).toEqual([]);
  });

  it('returns an empty array when every pixel is fully transparent', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 0,
      0, 255, 0, 0,
      1, 2, 3, 0,
    ]);
    expect(extractPalette(data)).toEqual([]);
  });

  it('treats alpha values other than 0 as opaque (alpha is not part of the key)', () => {
    // Same RGB, different non-zero alphas — all counted into one bucket.
    const data = new Uint8ClampedArray([
      0x80, 0x80, 0x80, 1,
      0x80, 0x80, 0x80, 128,
      0x80, 0x80, 0x80, 255,
    ]);
    // 0x80 >> 4 << 4 = 0x80
    expect(extractPalette(data)).toEqual(['#808080']);
  });

  it('defaults to at most 6 colors', () => {
    // 8 distinct quantized colors, one pixel each.
    const data = new Uint8ClampedArray([
      0x00, 0x00, 0x00, 255,
      0x10, 0x00, 0x00, 255,
      0x20, 0x00, 0x00, 255,
      0x30, 0x00, 0x00, 255,
      0x40, 0x00, 0x00, 255,
      0x50, 0x00, 0x00, 255,
      0x60, 0x00, 0x00, 255,
      0x70, 0x00, 0x00, 255,
    ]);
    expect(extractPalette(data)).toHaveLength(6);
  });

  it('produces lowercase 6-digit hex strings prefixed with #', () => {
    const data = new Uint8ClampedArray([
      0xab, 0xcd, 0xef, 255,
      0x00, 0x00, 0x00, 255,
    ]);
    const palette = extractPalette(data);
    for (const c of palette) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('pure black is rendered as #000000 with zero padding', () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255]);
    expect(extractPalette(data)).toEqual(['#000000']);
  });

  it('pure white quantizes to #f0f0f0 (high nibble only)', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255]);
    expect(extractPalette(data)).toEqual(['#f0f0f0']);
  });

  it('buckets near-identical colors that share the same high nibble', () => {
    // 0x10..0x1F all map to high nibble 0x10 -> 0x10 channel value.
    const data = new Uint8ClampedArray([
      0x10, 0x10, 0x10, 255,
      0x1f, 0x1f, 0x1f, 255,
      0x15, 0x18, 0x1a, 255,
    ]);
    expect(extractPalette(data)).toEqual(['#101010']);
  });

  it('separates colors whose channels differ in the high nibble', () => {
    const data = new Uint8ClampedArray([
      0x10, 0x10, 0x10, 255,
      0x20, 0x10, 0x10, 255,
    ]);
    const palette = extractPalette(data);
    expect(palette).toHaveLength(2);
    expect(palette).toContain('#101010');
    expect(palette).toContain('#201010');
  });

  it('orders colors by descending frequency', () => {
    // green x3 (most), red x2, blue x1
    const data = new Uint8ClampedArray([
      0, 255, 0, 255,
      0, 255, 0, 255,
      0, 255, 0, 255,
      255, 0, 0, 255,
      255, 0, 0, 255,
      0, 0, 255, 255,
    ]);
    const palette = extractPalette(data, 6);
    expect(palette[0]).toBe('#00f000');
    expect(palette[1]).toBe('#f00000');
    expect(palette[2]).toBe('#0000f0');
  });

  it('ignores a trailing incomplete pixel (fewer than 4 bytes)', () => {
    // One full red pixel + 3 dangling bytes that do not form a pixel.
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      10, 20, 30, // no alpha -> i+3 (=7) is out of [0..6] range for last group
    ]);
    expect(extractPalette(data)).toEqual(['#f00000']);
  });

  it('handles a count larger than the number of distinct colors', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 0, 255, 255,
    ]);
    const palette = extractPalette(data, 100);
    expect(palette).toHaveLength(2);
    expect(palette).toContain('#f00000');
    expect(palette).toContain('#0000f0');
  });

  it('is deterministic across repeated calls on the same data', () => {
    const data = new Uint8ClampedArray([
      0x90, 0x40, 0x10, 255,
      0x90, 0x40, 0x10, 255,
      0x20, 0x60, 0x80, 255,
    ]);
    const a = extractPalette(data, 4);
    const b = extractPalette(data, 4);
    expect(a).toEqual(b);
  });

  it('handles a large uniform image efficiently and returns a single color', () => {
    // 4000 identical opaque pixels.
    const data = new Uint8ClampedArray(4000 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0x33;
      data[i + 1] = 0x66;
      data[i + 2] = 0x99;
      data[i + 3] = 255;
    }
    // 0x33->0x30, 0x66->0x60, 0x99->0x90 after high-nibble quantization.
    expect(extractPalette(data)).toEqual(['#306090']);
  });

  it('counts only opaque pixels even when transparent pixels would otherwise dominate', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 0, // transparent red (would be most frequent)
      255, 0, 0, 0,
      255, 0, 0, 0,
      0, 0, 255, 255, // single opaque blue
    ]);
    expect(extractPalette(data)).toEqual(['#0000f0']);
  });

  it('returns negative count as an empty array (slice semantics)', () => {
    // slice(0, -1) on a single-entry list yields [].
    const data = new Uint8ClampedArray([255, 0, 0, 255]);
    expect(extractPalette(data, -1)).toEqual([]);
  });
});

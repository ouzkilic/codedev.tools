import { describe, it, expect } from 'vitest';
import { rgbaToAscii, RAMP } from './logic';

describe('rgbaToAscii', () => {
  it('maps dark pixels to dense chars and light pixels to space', () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 255, // black
      255, 255, 255, 255, // white
    ]);
    const out = rgbaToAscii(data, 2, 1);
    expect(out[0]).toBe('@');
    expect(out[1]).toBe(' ');
    expect(out.length).toBe(2);
  });

  it('produces one char per pixel', () => {
    const data = new Uint8ClampedArray([
      128, 128, 128, 255,
      0, 0, 0, 255,
      255, 255, 255, 255,
    ]);
    const out = rgbaToAscii(data, 3, 1);
    expect(out.length).toBe(3);
  });

  it('joins rows with a newline', () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 255,
      255, 255, 255, 255,
    ]);
    const out = rgbaToAscii(data, 1, 2);
    expect(out).toContain('\n');
    expect(out.split('\n')).toHaveLength(2);
  });

  it('uses the last ramp index for the brightest pixel', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255]);
    const out = rgbaToAscii(data, 1, 1);
    expect(out).toBe(RAMP[RAMP.length - 1]);
  });
});

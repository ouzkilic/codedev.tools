import { describe, it, expect } from 'vitest';
import { rgbaToAscii, RAMP } from './logic';

// Helper: builds an opaque grayscale pixel (r=g=b=v, a=255).
function gray(v: number): number[] {
  return [v, v, v, 255];
}

describe('RAMP constant', () => {
  it('is the expected 10-char ramp from dense to light', () => {
    expect(RAMP).toBe('@%#*+=-:. ');
    expect(RAMP.length).toBe(10);
  });

  it('starts with the densest char and ends with a space', () => {
    expect(RAMP[0]).toBe('@');
    expect(RAMP[RAMP.length - 1]).toBe(' ');
  });
});

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

  it('black pixel uses index 0 of the ramp', () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255]);
    expect(rgbaToAscii(data, 1, 1)).toBe('@');
  });

  it('maps mid-gray 128 to ramp index 4 (+)', () => {
    // l = 128, (128/255)*9 = 4.517 -> floor = 4 -> RAMP[4] = '+'
    const data = new Uint8ClampedArray(gray(128));
    expect(rgbaToAscii(data, 1, 1)).toBe('+');
    expect(RAMP[4]).toBe('+');
  });

  it('weights luminance per ITU coefficients (pure red)', () => {
    // l = 0.299*255 = 76.245, (76.245/255)*9 = 2.69 -> floor 2 -> '#'
    const data = new Uint8ClampedArray([255, 0, 0, 255]);
    expect(rgbaToAscii(data, 1, 1)).toBe('#');
  });

  it('weights luminance per ITU coefficients (pure green is brightest channel)', () => {
    // l = 0.587*255 = 149.685, (149.685/255)*9 = 5.28 -> floor 5 -> '='
    const data = new Uint8ClampedArray([0, 255, 0, 255]);
    expect(rgbaToAscii(data, 1, 1)).toBe('=');
  });

  it('weights luminance per ITU coefficients (pure blue is darkest channel)', () => {
    // l = 0.114*255 = 29.07, (29.07/255)*9 = 1.026 -> floor 1 -> '%'
    const data = new Uint8ClampedArray([0, 0, 255, 255]);
    expect(rgbaToAscii(data, 1, 1)).toBe('%');
  });

  it('ignores the alpha channel when computing luminance', () => {
    const opaque = new Uint8ClampedArray([100, 100, 100, 255]);
    const transparent = new Uint8ClampedArray([100, 100, 100, 0]);
    expect(rgbaToAscii(opaque, 1, 1)).toBe(rgbaToAscii(transparent, 1, 1));
  });

  it('renders a 2x2 grid row-major with correct newline placement', () => {
    const data = new Uint8ClampedArray([
      ...gray(0), ...gray(255), // row 0: @ then space
      ...gray(255), ...gray(0), // row 1: space then @
    ]);
    const out = rgbaToAscii(data, 2, 2);
    expect(out).toBe('@ \n @');
  });

  it('produces height-1 newlines for a single-column image', () => {
    const data = new Uint8ClampedArray([
      ...gray(0),
      ...gray(0),
      ...gray(0),
      ...gray(0),
    ]);
    const out = rgbaToAscii(data, 1, 4);
    expect(out).toBe('@\n@\n@\n@');
    expect((out.match(/\n/g) ?? []).length).toBe(3);
  });

  it('returns an empty string for a zero-size image', () => {
    const out = rgbaToAscii(new Uint8ClampedArray([]), 0, 0);
    expect(out).toBe('');
  });

  it('returns empty rows joined by newlines for zero-width but positive height', () => {
    // each row is empty, joined with '\n' -> height-1 newlines
    const out = rgbaToAscii(new Uint8ClampedArray([]), 0, 3);
    expect(out).toBe('\n\n');
    expect(out.length).toBe(2);
  });

  it('respects a custom ramp (binary inverted ramp)', () => {
    // ramp '#.' has last index 1.
    // black: l=0 -> floor(0*1)=0 -> '#'
    // white: l=255 -> floor(1*1)=1 -> '.'
    const data = new Uint8ClampedArray([
      ...gray(0),
      ...gray(255),
    ]);
    expect(rgbaToAscii(data, 2, 1, '#.')).toBe('#.');
  });

  it('with a single-char ramp every pixel maps to that char (last index 0)', () => {
    // last = 0, idx = floor((l/255)*0) = 0 for all pixels
    const data = new Uint8ClampedArray([
      ...gray(0),
      ...gray(128),
      ...gray(255),
    ]);
    expect(rgbaToAscii(data, 3, 1, 'X')).toBe('XXX');
  });

  it('is deterministic for identical inputs', () => {
    const make = () => new Uint8ClampedArray([
      ...gray(10), ...gray(90), ...gray(200),
    ]);
    expect(rgbaToAscii(make(), 3, 1)).toBe(rgbaToAscii(make(), 3, 1));
  });

  it('handles a larger image without crashing and yields correct dimensions', () => {
    const w = 40;
    const h = 20;
    const arr: number[] = [];
    for (let i = 0; i < w * h; i++) {
      // gradient based on index, fully opaque
      const v = (i * 7) % 256;
      arr.push(v, v, v, 255);
    }
    const out = rgbaToAscii(new Uint8ClampedArray(arr), w, h);
    const lines = out.split('\n');
    expect(lines).toHaveLength(h);
    for (const line of lines) {
      expect(line.length).toBe(w);
      // every char must come from the ramp
      for (const ch of line) {
        expect(RAMP.includes(ch)).toBe(true);
      }
    }
  });

  it('Uint8ClampedArray clamps over-range values so they map like 255', () => {
    // 300 clamps to 255 inside Uint8ClampedArray
    const data = new Uint8ClampedArray([300, 300, 300, 255]);
    expect(data[0]).toBe(255);
    expect(rgbaToAscii(data, 1, 1)).toBe(' ');
  });

  it('luminance just below the 255 boundary still maps inside the ramp', () => {
    // gray 254: l=254, (254/255)*9 = 8.96 -> floor 8 -> RAMP[8] = '.'
    const data = new Uint8ClampedArray(gray(254));
    expect(rgbaToAscii(data, 1, 1)).toBe('.');
    expect(RAMP[8]).toBe('.');
  });

  it('monotonically non-increasing density as brightness increases', () => {
    // As gray value rises, the ramp index should never decrease.
    let prevIdx = -1;
    for (let v = 0; v <= 255; v += 5) {
      const out = rgbaToAscii(new Uint8ClampedArray(gray(v)), 1, 1);
      const idx = RAMP.indexOf(out);
      expect(idx).toBeGreaterThanOrEqual(prevIdx);
      prevIdx = idx;
    }
  });
});

import { describe, it, expect } from 'vitest';
import { computeCanvasSize } from './logic';
import type { SizeOpts } from './logic';

const opts: SizeOpts = { lineHeight: 20, padding: 16, charWidth: 8 };

describe('codeImage / computeCanvasSize', () => {
  it('sizes to the longest line and line count', () => {
    expect(computeCanvasSize(['ab', 'abcd'], opts)).toEqual({ width: 120, height: 72 });
  });

  it('grows width with long lines', () => {
    const { width } = computeCanvasSize(['x'.repeat(50)], opts);
    expect(width).toBe(16 * 2 + 50 * 8);
  });

  it('enforces minimum size for a single empty line', () => {
    expect(computeCanvasSize([''], opts)).toEqual({ width: 120, height: 60 });
  });

  it('enforces minimum size for an empty array (treats line count as 1)', () => {
    // maxLen=0 -> width 32 -> 120; lines.length=0 -> max(0,1)=1 -> height 52 -> 60
    expect(computeCanvasSize([], opts)).toEqual({ width: 120, height: 60 });
  });

  it('uses the longest line, not the last line, for width', () => {
    // maxLen=10 -> width 32 + 80 = 112 -> max 120
    const { width } = computeCanvasSize(['x'.repeat(10), 'a'], opts);
    expect(width).toBe(120);
  });

  it('width crosses the 120 minimum threshold exactly', () => {
    // need 32 + len*8 >= 120 -> len*8 >= 88 -> len >= 11
    expect(computeCanvasSize(['x'.repeat(10)], opts).width).toBe(120); // 112 -> 120
    expect(computeCanvasSize(['x'.repeat(11)], opts).width).toBe(120); // exactly 120
    expect(computeCanvasSize(['x'.repeat(12)], opts).width).toBe(128); // 128 > 120
  });

  it('grows height with the number of lines', () => {
    const lines = Array.from({ length: 10 }, (_, i) => `line${i}`);
    const { height } = computeCanvasSize(lines, opts);
    expect(height).toBe(16 * 2 + 10 * 20); // 232
  });

  it('height crosses the 60 minimum threshold', () => {
    // 32 + n*20 >= 60 -> n >= 1.4 -> n=2 gives 72
    expect(computeCanvasSize(['a'], opts).height).toBe(60); // 52 -> 60
    expect(computeCanvasSize(['a', 'b'], opts).height).toBe(72); // 72 > 60
  });

  it('applies Math.ceil to fractional width', () => {
    const fractional: SizeOpts = { lineHeight: 20, padding: 16.5, charWidth: 8.3 };
    // width = ceil(33 + 50*8.3) = ceil(33 + 415) = ceil(448) = 448
    const { width } = computeCanvasSize(['x'.repeat(50)], fractional);
    expect(width).toBe(Math.ceil(16.5 * 2 + 50 * 8.3));
    expect(Number.isInteger(width)).toBe(true);
  });

  it('applies Math.ceil to fractional height', () => {
    const fractional: SizeOpts = { lineHeight: 20.7, padding: 16.5, charWidth: 8 };
    const lines = Array.from({ length: 5 }, () => 'x'.repeat(50));
    const { height } = computeCanvasSize(lines, fractional);
    expect(height).toBe(Math.ceil(16.5 * 2 + 5 * 20.7));
    expect(Number.isInteger(height)).toBe(true);
  });

  it('handles unicode/emoji by JS string length (code units)', () => {
    // 'a😀b' has length 4 (emoji is a surrogate pair), 'café' has length 4
    const line = 'a😀b'; // length 4
    expect(line.length).toBe(4);
    const single = computeCanvasSize([line], opts);
    // width = 32 + 4*8 = 64 -> 120
    expect(single.width).toBe(120);
  });

  it('counts whitespace and special chars toward line length', () => {
    const line = '\t  \\n"quote"  '; // literal chars, length 14
    expect(line.length).toBe(14);
    const { width } = computeCanvasSize([line], opts);
    expect(width).toBe(Math.max(16 * 2 + 14 * 8, 120));
  });

  it('handles a very large input deterministically', () => {
    const big = Array.from({ length: 1000 }, () => 'x'.repeat(200));
    const { width, height } = computeCanvasSize(big, opts);
    expect(width).toBe(16 * 2 + 200 * 8); // 1632
    expect(height).toBe(16 * 2 + 1000 * 20); // 20032
  });

  it('handles zero padding, charWidth, and lineHeight via minimums', () => {
    const zero: SizeOpts = { lineHeight: 0, padding: 0, charWidth: 0 };
    expect(computeCanvasSize(['anything'], zero)).toEqual({ width: 120, height: 60 });
  });

  it('clamps negative-derived sizes up to the minimums', () => {
    const negative: SizeOpts = { lineHeight: -5, padding: -10, charWidth: -2 };
    // width = ceil(-20 + maxLen*-2) negative -> max(_,120)=120; height similarly -> 60
    expect(computeCanvasSize(['abc', 'de'], negative)).toEqual({ width: 120, height: 60 });
  });

  it('is deterministic for repeated calls', () => {
    const lines = ['const x = 1;', 'function foo() {}', 'return x;'];
    const a = computeCanvasSize(lines, opts);
    const b = computeCanvasSize(lines, opts);
    expect(a).toEqual(b);
  });

  it('does not mutate the input lines or opts', () => {
    const lines = ['aaaa', 'bb'];
    const linesCopy = [...lines];
    const optsCopy = { ...opts };
    computeCanvasSize(lines, opts);
    expect(lines).toEqual(linesCopy);
    expect(opts).toEqual(optsCopy);
  });

  it('width is monotonic non-decreasing in the longest line length', () => {
    let prev = 0;
    for (const len of [5, 11, 12, 20, 50, 100]) {
      const w = computeCanvasSize(['x'.repeat(len)], opts).width;
      expect(w).toBeGreaterThanOrEqual(prev);
      prev = w;
    }
  });

  it('height is monotonic non-decreasing in line count', () => {
    let prev = 0;
    for (const n of [1, 2, 5, 10, 50]) {
      const lines = Array.from({ length: n }, () => 'a');
      const h = computeCanvasSize(lines, opts).height;
      expect(h).toBeGreaterThanOrEqual(prev);
      prev = h;
    }
  });

  it('always returns integer width and height at the minimum', () => {
    const { width, height } = computeCanvasSize([''], opts);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
    expect(width).toBeGreaterThanOrEqual(120);
    expect(height).toBeGreaterThanOrEqual(60);
  });
});

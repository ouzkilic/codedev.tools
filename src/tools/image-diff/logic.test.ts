import { describe, expect, it } from 'vitest';
import { diffStats } from './logic';

describe('diffStats', () => {
  it('reports no change for two identical 1-pixel buffers', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([0, 0, 0, 255]);
    expect(diffStats(a, b)).toEqual({ changed: 0, total: 1, percent: 0 });
  });

  it('reports full change for black vs white 1-pixel', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([255, 255, 255, 255]);
    expect(diffStats(a, b)).toEqual({ changed: 1, total: 1, percent: 100 });
  });

  it('reports 50% when one of two pixels differs', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
    const b = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    expect(diffStats(a, b)).toEqual({ changed: 1, total: 2, percent: 50 });
  });

  it('treats differing alpha as changed', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([0, 0, 0, 0]);
    expect(diffStats(a, b)).toEqual({ changed: 1, total: 1, percent: 100 });
  });

  it('respects the threshold', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([5, 0, 0, 255]);
    expect(diffStats(a, b, 10).changed).toBe(0);
    expect(diffStats(a, b, 0).changed).toBe(1);
  });

  it('counts extra pixels in differing-length buffers as changed', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
    const b = new Uint8ClampedArray([0, 0, 0, 255]);
    expect(diffStats(a, b)).toEqual({ changed: 1, total: 2, percent: 50 });
  });

  // --- Empty / zero-size buffers ---

  it('returns zeroed stats for two empty buffers (total 0 -> percent 0)', () => {
    const a = new Uint8ClampedArray([]);
    const b = new Uint8ClampedArray([]);
    expect(diffStats(a, b)).toEqual({ changed: 0, total: 0, percent: 0 });
  });

  it('keeps percent at 0 when a is empty even though b has pixels (division by zero guard)', () => {
    // lenA = 0 -> total = 0 -> percent guarded to 0, but extra pixels still counted as changed
    const a = new Uint8ClampedArray([]);
    const b = new Uint8ClampedArray([0, 0, 0, 255]);
    expect(diffStats(a, b)).toEqual({ changed: 1, total: 0, percent: 0 });
  });

  it('counts all pixels of a as extra/changed when b is empty', () => {
    const a = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const b = new Uint8ClampedArray([]);
    // lenA = 3, lenB = 0, overlap = 0, changed = |3 - 0| = 3
    expect(diffStats(a, b)).toEqual({ changed: 3, total: 3, percent: 100 });
  });

  // --- Per-channel detection ---

  it('detects a change in only the green channel', () => {
    const a = new Uint8ClampedArray([10, 10, 10, 255]);
    const b = new Uint8ClampedArray([10, 200, 10, 255]);
    expect(diffStats(a, b).changed).toBe(1);
  });

  it('detects a change in only the blue channel', () => {
    const a = new Uint8ClampedArray([10, 10, 10, 255]);
    const b = new Uint8ClampedArray([10, 10, 200, 255]);
    expect(diffStats(a, b).changed).toBe(1);
  });

  it('ignores RGB difference below threshold but always honours alpha difference', () => {
    // RGB within threshold (diff 3 <= 5) but alpha differs -> still changed
    const a = new Uint8ClampedArray([10, 10, 10, 255]);
    const b = new Uint8ClampedArray([13, 13, 13, 254]);
    expect(diffStats(a, b, 5).changed).toBe(1);
  });

  // --- Threshold boundary semantics (strictly greater-than) ---

  it('treats a diff exactly equal to the threshold as unchanged (strict >)', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([10, 0, 0, 255]);
    // dr = 10, threshold = 10, 10 > 10 is false -> unchanged
    expect(diffStats(a, b, 10).changed).toBe(0);
  });

  it('treats a diff one above the threshold as changed', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([11, 0, 0, 255]);
    expect(diffStats(a, b, 10).changed).toBe(1);
  });

  it('with a maximal threshold of 255 no RGB change is ever counted', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([255, 255, 255, 255]);
    // max channel diff is 255, 255 > 255 is false, alpha equal -> unchanged
    expect(diffStats(a, b, 255).changed).toBe(0);
  });

  it('default threshold of 0 flags any single-step RGB difference', () => {
    const a = new Uint8ClampedArray([100, 100, 100, 255]);
    const b = new Uint8ClampedArray([101, 100, 100, 255]);
    expect(diffStats(a, b).changed).toBe(1);
  });

  // --- Direction-independence of difference (abs) ---

  it('is symmetric in channel direction (b brighter or darker counts the same)', () => {
    const a = new Uint8ClampedArray([100, 100, 100, 255]);
    const brighter = new Uint8ClampedArray([150, 100, 100, 255]);
    const darker = new Uint8ClampedArray([50, 100, 100, 255]);
    expect(diffStats(a, brighter).changed).toBe(diffStats(a, darker).changed);
  });

  // --- Non-multiple-of-4 lengths (floored pixel count) ---

  it('floors the pixel count for buffers whose length is not a multiple of 4', () => {
    // length 7 -> floor(7/4) = 1 pixel considered
    const a = new Uint8ClampedArray([0, 0, 0, 255, 9, 9, 9]);
    const b = new Uint8ClampedArray([0, 0, 0, 255, 9, 9, 9]);
    expect(diffStats(a, b)).toEqual({ changed: 0, total: 1, percent: 0 });
  });

  // --- b longer than a: changed can exceed total ---

  it('counts extra pixels from a longer b, allowing changed > total', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255]);
    const b = new Uint8ClampedArray([0, 0, 0, 255, 1, 1, 1, 255, 2, 2, 2, 255]);
    // lenA = 1, lenB = 3, overlap pixel identical -> 0, extra = |1 - 3| = 2
    const result = diffStats(a, b);
    expect(result).toEqual({ changed: 2, total: 1, percent: 200 });
  });

  // --- Percent rounding to 2 decimals ---

  it('rounds percent to two decimal places', () => {
    // 1 changed of 3 -> 33.3333... -> 33.33
    const a = new Uint8ClampedArray([
      0, 0, 0, 255, // unchanged
      0, 0, 0, 255, // unchanged
      0, 0, 0, 255, // changed
    ]);
    const b = new Uint8ClampedArray([
      0, 0, 0, 255,
      0, 0, 0, 255,
      255, 0, 0, 255,
    ]);
    const result = diffStats(a, b);
    expect(result.changed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percent).toBe(33.33);
  });

  it('rounds 2 of 3 changed to 66.67 percent', () => {
    const a = new Uint8ClampedArray([
      0, 0, 0, 255,
      0, 0, 0, 255,
      0, 0, 0, 255,
    ]);
    const b = new Uint8ClampedArray([
      255, 0, 0, 255,
      255, 0, 0, 255,
      0, 0, 0, 255,
    ]);
    const result = diffStats(a, b);
    expect(result.changed).toBe(2);
    expect(result.percent).toBe(66.67);
  });

  // --- Large input determinism ---

  it('handles a large identical buffer deterministically', () => {
    const n = 10000; // pixels
    const a = new Uint8ClampedArray(n * 4);
    const b = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < a.length; i += 4) {
      a[i] = 120;
      a[i + 1] = 120;
      a[i + 2] = 120;
      a[i + 3] = 255;
      b[i] = 120;
      b[i + 1] = 120;
      b[i + 2] = 120;
      b[i + 3] = 255;
    }
    expect(diffStats(a, b)).toEqual({ changed: 0, total: n, percent: 0 });
  });

  it('counts every pixel changed in a large fully-different buffer', () => {
    const n = 2500;
    const a = new Uint8ClampedArray(n * 4);
    const b = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < a.length; i += 4) {
      a[i] = 0; a[i + 1] = 0; a[i + 2] = 0; a[i + 3] = 255;
      b[i] = 255; b[i + 1] = 255; b[i + 2] = 255; b[i + 3] = 255;
    }
    expect(diffStats(a, b)).toEqual({ changed: n, total: n, percent: 100 });
  });

  // --- Clamping behaviour of Uint8ClampedArray ---

  it('respects Uint8ClampedArray clamping when computing channel diffs', () => {
    // 300 clamps to 255, -5 clamps to 0; so a = [255,...], b = [0,...]
    const a = new Uint8ClampedArray([300, 0, 0, 255]);
    const b = new Uint8ClampedArray([-5, 0, 0, 255]);
    expect(a[0]).toBe(255);
    expect(b[0]).toBe(0);
    expect(diffStats(a, b).changed).toBe(1);
  });

  // --- Determinism / idempotency ---

  it('is deterministic across repeated calls', () => {
    const a = new Uint8ClampedArray([0, 50, 100, 255, 0, 0, 0, 255]);
    const b = new Uint8ClampedArray([0, 60, 100, 255, 0, 0, 0, 255]);
    const first = diffStats(a, b, 5);
    const second = diffStats(a, b, 5);
    expect(first).toEqual(second);
  });

  it('does not mutate the input buffers', () => {
    const a = new Uint8ClampedArray([10, 20, 30, 255]);
    const b = new Uint8ClampedArray([40, 50, 60, 128]);
    const aCopy = Uint8ClampedArray.from(a);
    const bCopy = Uint8ClampedArray.from(b);
    diffStats(a, b, 3);
    expect(Array.from(a)).toEqual(Array.from(aCopy));
    expect(Array.from(b)).toEqual(Array.from(bCopy));
  });
});

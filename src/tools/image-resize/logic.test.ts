import { describe, expect, it } from 'vitest';
import { computeSize } from './logic';
import type { Size } from './logic';

describe('computeSize', () => {
  // --- existing assertions (kept) ---
  it('keeps aspect ratio when both targets given', () => {
    expect(computeSize(1000, 500, 100, 100, true)).toEqual({ width: 100, height: 50 });
  });

  it('uses exact targets when aspect not kept', () => {
    expect(computeSize(1000, 500, 200, 200, false)).toEqual({ width: 200, height: 200 });
  });

  it('falls back to source size when no targets given', () => {
    expect(computeSize(1000, 500, 0, 0, true)).toEqual({ width: 1000, height: 500 });
  });

  it('scales by width only when keeping aspect', () => {
    expect(computeSize(1000, 500, 200, 0, true)).toEqual({ width: 200, height: 100 });
  });

  it('scales by height only when keeping aspect', () => {
    expect(computeSize(1000, 500, 0, 100, true)).toEqual({ width: 200, height: 100 });
  });

  it('uses source dimension for a missing target when aspect not kept', () => {
    expect(computeSize(1000, 500, 300, 0, false)).toEqual({ width: 300, height: 500 });
  });

  // --- both targets given, keepAspect: chooses the smaller scale (fit/contain) ---
  it('fits within a box using the smaller scale when width is the constraint', () => {
    // scale = min(300/1000, 300/500) = min(0.3, 0.6) = 0.3
    expect(computeSize(1000, 500, 300, 300, true)).toEqual({ width: 300, height: 150 });
  });

  it('fits within a box using the smaller scale when height is the constraint', () => {
    // scale = min(400/500, 200/1000) = min(0.8, 0.2) = 0.2
    expect(computeSize(500, 1000, 400, 200, true)).toEqual({ width: 100, height: 200 });
  });

  it('handles a square source fitting into a wider box', () => {
    // scale = min(200/100, 100/100) = min(2, 1) = 1
    expect(computeSize(100, 100, 200, 100, true)).toEqual({ width: 100, height: 100 });
  });

  it('can upscale when target box is larger than source', () => {
    // scale = min(2000/1000, 1000/500) = min(2, 2) = 2
    expect(computeSize(1000, 500, 2000, 1000, true)).toEqual({ width: 2000, height: 1000 });
  });

  // --- rounding behavior ---
  it('rounds non-integer scaled dimensions (round half up)', () => {
    // scale by width: 333/1000 = 0.333; height = 500 * 0.333 = 166.5 -> 167
    expect(computeSize(1000, 500, 333, 0, true)).toEqual({ width: 333, height: 167 });
  });

  it('rounds a fractional width down when below .5', () => {
    // scale by height: 101/500 = 0.202; width = 1000 * 0.202 = 202; height stays 101
    expect(computeSize(1000, 500, 0, 101, true)).toEqual({ width: 202, height: 101 });
  });

  it('rounds odd-ratio scaling deterministically', () => {
    // both targets: scale = min(100/3, 100/3) = 33.333...; w = 3*33.333=100, h = 3*33.333=100
    expect(computeSize(3, 3, 100, 100, true)).toEqual({ width: 100, height: 100 });
  });

  // --- no aspect: exact-or-source fallback per dimension ---
  it('uses source width but exact height when only height given (no aspect)', () => {
    expect(computeSize(1000, 500, 0, 250, false)).toEqual({ width: 1000, height: 250 });
  });

  it('falls back to source for both when no targets and not keeping aspect', () => {
    expect(computeSize(800, 600, 0, 0, false)).toEqual({ width: 800, height: 600 });
  });

  it('distorts freely when aspect not kept and both targets given', () => {
    expect(computeSize(1000, 1000, 50, 900, false)).toEqual({ width: 50, height: 900 });
  });

  // --- keepAspect but no valid targets (both <= 0) hits final fallback ---
  it('returns source size when keepAspect but both targets are zero', () => {
    expect(computeSize(640, 480, 0, 0, true)).toEqual({ width: 640, height: 480 });
  });

  it('returns source size when keepAspect but both targets are negative', () => {
    // none of the keepAspect branches match (targetW>0 false, targetH>0 false);
    // final fallback: targetW(-5) is truthy so width=-5, targetH(-9) truthy so height=-9
    expect(computeSize(640, 480, -5, -9, true)).toEqual({ width: -5, height: -9 });
  });

  // --- boundary / extreme values ---
  it('handles very large source dimensions without overflow in scaling', () => {
    // scale by width: 1/1_000_000 ; height = 500_000 * (1/1_000_000) = 0.5 -> round -> 1 (round half up? Math.round(0.5)=1)
    expect(computeSize(1_000_000, 500_000, 1, 0, true)).toEqual({ width: 1, height: 1 });
  });

  it('handles a one-pixel source', () => {
    // scale by width: 500/1 = 500; height = 1 * 500 = 500
    expect(computeSize(1, 1, 500, 0, true)).toEqual({ width: 500, height: 500 });
  });

  it('treats keepAspect with only width positive (height zero) as width-driven scale', () => {
    // targetW>0, targetH<=0 branch
    expect(computeSize(1200, 800, 600, 0, true)).toEqual({ width: 600, height: 400 });
  });

  it('treats keepAspect with only height positive (width negative) as height-driven scale', () => {
    // targetH>0 && targetW<=0 branch: scale = 240/480 = 0.5
    expect(computeSize(640, 480, -1, 240, true)).toEqual({ width: 320, height: 240 });
  });

  // --- determinism / property checks ---
  it('is deterministic for repeated identical calls', () => {
    const a = computeSize(1920, 1080, 1280, 720, true);
    const b = computeSize(1920, 1080, 1280, 720, true);
    expect(a).toEqual(b);
    expect(a).toEqual({ width: 1280, height: 720 });
  });

  it('preserves the source aspect ratio (within rounding) when keeping aspect', () => {
    const srcW = 1600;
    const srcH = 900;
    const out: Size = computeSize(srcW, srcH, 400, 0, true);
    const srcRatio = srcW / srcH;
    const outRatio = out.width / out.height;
    expect(Math.abs(srcRatio - outRatio)).toBeLessThan(0.01);
  });

  it('always returns integer dimensions when scaling with keepAspect', () => {
    const out = computeSize(1000, 333, 777, 0, true);
    expect(Number.isInteger(out.width)).toBe(true);
    expect(Number.isInteger(out.height)).toBe(true);
  });

  it('returns the exact requested box when both targets positive and aspect already matches', () => {
    // source already 2:1, box 800x400 same ratio -> exact
    expect(computeSize(1000, 500, 800, 400, true)).toEqual({ width: 800, height: 400 });
  });
});

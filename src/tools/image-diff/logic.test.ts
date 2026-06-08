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
});

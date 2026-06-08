import { describe, expect, it } from 'vitest';
import { computeSize } from './logic';

describe('computeSize', () => {
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
});

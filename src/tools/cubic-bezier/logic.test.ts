import { describe, it, expect } from 'vitest';
import { buildBezier } from './logic';

describe('buildBezier', () => {
  it('returns defaults', () => {
    expect(buildBezier({})).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });

  it('uses custom values', () => {
    expect(buildBezier({ x1: '0', y1: '0', x2: '1', y2: '1' })).toContain(
      'cubic-bezier(0, 0, 1, 1)',
    );
  });

  it('falls back to defaults on NaN', () => {
    expect(buildBezier({ x1: 'foo', y1: 'bar', x2: '', y2: 'baz' })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });
});

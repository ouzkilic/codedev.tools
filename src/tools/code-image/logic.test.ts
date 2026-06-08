import { describe, it, expect } from 'vitest';
import { computeCanvasSize } from './logic';

const opts = { lineHeight: 20, padding: 16, charWidth: 8 };

describe('codeImage', () => {
  it('sizes to the longest line and line count', () => {
    expect(computeCanvasSize(['ab', 'abcd'], opts)).toEqual({ width: 120, height: 72 });
  });
  it('grows width with long lines', () => {
    const { width } = computeCanvasSize(['x'.repeat(50)], opts);
    expect(width).toBe(16 * 2 + 50 * 8);
  });
  it('enforces minimum size', () => {
    expect(computeCanvasSize([''], opts)).toEqual({ width: 120, height: 60 });
  });
});

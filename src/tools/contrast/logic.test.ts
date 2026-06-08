import { describe, it, expect } from 'vitest';
import { contrastRatio, contrastLogic } from './logic';

describe('contrast', () => {
  it('computes 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });
  it('computes 1:1 for identical colors', () => {
    expect(contrastRatio('#777', '#777')).toBeCloseTo(1, 5);
  });
  it('is order-independent', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(contrastRatio('#fff', '#000'), 5);
  });
  it('reports AA pass for black/white', () => {
    const out = contrastLogic.transform('#000', { options: {}, secondary: '#fff' });
    expect(out).toContain('21:1');
    expect(out).toMatch(/AA.*Pass/);
  });
  it('throws on invalid color', () => {
    expect(() => contrastRatio('nope', '#fff')).toThrow();
  });
});

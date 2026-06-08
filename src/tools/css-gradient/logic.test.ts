import { describe, it, expect } from 'vitest';
import { buildGradient, gradientCss } from './logic';

describe('cssGradient', () => {
  it('builds a linear gradient', () => {
    expect(buildGradient({ type: 'linear', angle: '90deg', from: '#f00', to: '#00f' }))
      .toBe('linear-gradient(90deg, #f00, #00f)');
  });
  it('builds a radial gradient', () => {
    expect(buildGradient({ type: 'radial', angle: 'circle', from: '#fff', to: '#000' }))
      .toBe('radial-gradient(circle, #fff, #000)');
  });
  it('wraps the value in a background declaration', () => {
    expect(gradientCss({ type: 'linear', angle: '45deg', from: 'red', to: 'blue' }))
      .toBe('background: linear-gradient(45deg, red, blue);');
  });
});

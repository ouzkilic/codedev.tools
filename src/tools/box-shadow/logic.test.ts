import { describe, it, expect } from 'vitest';
import { buildShadow, boxShadowCss } from './logic';

describe('boxShadow', () => {
  it('builds a shadow from options', () => {
    expect(buildShadow({ x: '0', y: '4', blur: '12', spread: '0', color: 'rgba(0,0,0,0.25)', inset: false }))
      .toBe('0px 4px 12px 0px rgba(0,0,0,0.25)');
  });
  it('adds inset when enabled', () => {
    expect(buildShadow({ x: '1', y: '1', blur: '2', spread: '0', color: '#000', inset: true }))
      .toBe('inset 1px 1px 2px 0px #000');
  });
  it('wraps in a box-shadow declaration', () => {
    expect(boxShadowCss({ x: '0', y: '2', blur: '4', spread: '0', color: '#333', inset: false }))
      .toBe('box-shadow: 0px 2px 4px 0px #333;');
  });
});

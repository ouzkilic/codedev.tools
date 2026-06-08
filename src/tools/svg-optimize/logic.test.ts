import { describe, expect, it } from 'vitest';
import { svgOptimizeLogic } from './logic';

const ctx = { options: {}, secondary: '' };

describe('svgOptimizeLogic', () => {
  it('removes xml declaration, comments and collapses whitespace', () => {
    const input = '<?xml version="1.0"?>\n<svg>\n  <!-- a comment -->\n  <rect/>\n</svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg><rect/></svg>');
  });

  it('preserves attributes', () => {
    const input = '<svg width="10" height="10">\n  <rect x="1" y="2"/>\n</svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe(
      '<svg width="10" height="10"><rect x="1" y="2"/></svg>',
    );
  });

  it('is idempotent on already-minified svg', () => {
    const minified = '<svg><rect/></svg>';
    expect(svgOptimizeLogic.transform(minified, ctx)).toBe(minified);
  });
});

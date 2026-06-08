import { describe, it, expect } from 'vitest';
import { hexToRgb, describeColor } from './logic';

describe('colorPicker', () => {
  it('parses hex to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('describes a color in HEX/RGB/HSL', () => {
    const out = describeColor('#ff0000');
    expect(out).toContain('rgb(255, 0, 0)');
    expect(out).toContain('hsl(0, 100%, 50%)');
  });
  it('handles blue', () => {
    expect(describeColor('#0000ff')).toContain('hsl(240, 100%, 50%)');
  });
});

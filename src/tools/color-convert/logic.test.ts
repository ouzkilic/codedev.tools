import { describe, it, expect } from 'vitest';
import { colorConvertLogic } from './logic';

const conv = (s: string) => colorConvertLogic.transform(s);

describe('colorConvert', () => {
  it('converts hex to rgb and hsl', () => {
    const out = conv('#ff0000');
    expect(out).toContain('rgb(255, 0, 0)');
    expect(out).toContain('hsl(0, 100%, 50%)');
  });
  it('converts rgb input to hex', () => {
    expect(conv('rgb(0, 255, 0)')).toContain('#00ff00');
  });
  it('outputs HSV and CMYK', () => {
    const out = conv('#ff0000');
    expect(out).toContain('hsv(0, 100%, 100%)');
    expect(out).toContain('cmyk(0%, 100%, 100%, 0%)');
  });
  it('expands shorthand hex', () => {
    expect(conv('#fff')).toContain('#ffffff');
  });
  it('converts hsl input back to hex', () => {
    expect(conv('hsl(240, 100%, 50%)')).toContain('#0000ff');
  });
  it('throws on an invalid color', () => {
    expect(() => conv('not-a-color')).toThrow();
  });
});

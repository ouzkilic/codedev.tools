import { describe, it, expect } from 'vitest';
import { colorConvertLogic } from './logic';

const conv = (s: string) => colorConvertLogic.transform(s);

describe('colorConvert', () => {
  it('converts hex to rgb and hsl', () => {
    const out = conv('#ff0000');
    expect(out).toContain('RGB:  rgb(255, 0, 0)');
    expect(out).toContain('HSL:  hsl(0, 100%, 50%)');
  });
  it('converts rgb input to hex', () => {
    expect(conv('rgb(0, 255, 0)')).toContain('HEX:  #00ff00');
  });
  it('expands shorthand hex', () => {
    expect(conv('#fff')).toContain('HEX:  #ffffff');
  });
  it('converts hsl input back to hex', () => {
    expect(conv('hsl(240, 100%, 50%)')).toContain('HEX:  #0000ff');
  });
  it('throws on an invalid color', () => {
    expect(() => conv('not-a-color')).toThrow();
  });
});

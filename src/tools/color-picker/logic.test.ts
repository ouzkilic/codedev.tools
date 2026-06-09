import { describe, it, expect } from 'vitest';
import { hexToRgb, describeColor } from './logic';

describe('hexToRgb', () => {
  it('parses red hex to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses green hex to rgb', () => {
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses blue hex to rgb', () => {
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses white and black', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses an arbitrary mixed color', () => {
    expect(hexToRgb('#1a2b3c')).toEqual({ r: 0x1a, g: 0x2b, b: 0x3c });
    expect(hexToRgb('#1a2b3c')).toEqual({ r: 26, g: 43, b: 60 });
  });

  it('parses hex without leading hash', () => {
    expect(hexToRgb('ff8000')).toEqual({ r: 255, g: 128, b: 0 });
  });

  it('is case-insensitive on hex digits', () => {
    expect(hexToRgb('#ABCDEF')).toEqual(hexToRgb('#abcdef'));
    expect(hexToRgb('#ABCDEF')).toEqual({ r: 171, g: 205, b: 239 });
  });

  it('parses mid-gray correctly', () => {
    expect(hexToRgb('#808080')).toEqual({ r: 128, g: 128, b: 128 });
  });

  it('throws on non-hex characters instead of returning NaN', () => {
    expect(() => hexToRgb('#zzzzzz')).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => hexToRgb('')).toThrow();
  });

  it('ignores extra characters beyond the first six', () => {
    expect(hexToRgb('#ff0000ffff')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('expands 3-digit shorthand hex (#fff -> white)', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#fff')).toEqual(hexToRgb('#ffffff'));
  });

  it('expands shorthand without hash and mixed channels', () => {
    expect(hexToRgb('#0f8')).toEqual({ r: 0, g: 255, b: 136 });
    expect(hexToRgb('abc')).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc });
  });

  it('throws on malformed lengths (not 3 or 6 valid digits)', () => {
    expect(() => hexToRgb('#ff')).toThrow();
  });
});

describe('describeColor', () => {
  it('describes red in HEX/RGB/HSL', () => {
    const out = describeColor('#ff0000');
    expect(out).toContain('HEX:  #ff0000');
    expect(out).toContain('RGB:  rgb(255, 0, 0)');
    expect(out).toContain('HSL:  hsl(0, 100%, 50%)');
  });

  it('produces exactly three labeled lines', () => {
    const lines = describeColor('#ff0000').split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0].startsWith('HEX:')).toBe(true);
    expect(lines[1].startsWith('RGB:')).toBe(true);
    expect(lines[2].startsWith('HSL:')).toBe(true);
  });

  it('lowercases the hex value in output', () => {
    expect(describeColor('#FF0000')).toContain('HEX:  #ff0000');
  });

  it('handles blue hue', () => {
    expect(describeColor('#0000ff')).toContain('hsl(240, 100%, 50%)');
  });

  it('computes green hue (120)', () => {
    expect(describeColor('#00ff00')).toContain('hsl(120, 100%, 50%)');
  });

  it('computes yellow hue (60) via the max===r branch', () => {
    expect(describeColor('#ffff00')).toContain('hsl(60, 100%, 50%)');
  });

  it('computes cyan hue (180) via the max===g branch', () => {
    expect(describeColor('#00ffff')).toContain('hsl(180, 100%, 50%)');
  });

  it('computes magenta hue (300) via the max===b branch', () => {
    expect(describeColor('#ff00ff')).toContain('hsl(300, 100%, 50%)');
  });

  it('reports zero saturation for grayscale (achromatic d===0)', () => {
    expect(describeColor('#808080')).toContain('hsl(0, 0%, 50%)');
  });

  it('reports white as full lightness, zero saturation', () => {
    expect(describeColor('#ffffff')).toContain('hsl(0, 0%, 100%)');
  });

  it('reports black as zero lightness, zero saturation', () => {
    expect(describeColor('#000000')).toContain('hsl(0, 0%, 0%)');
  });

  it('exercises the l>0.5 saturation branch (light pink)', () => {
    // r=255 g=204 b=204 -> l=0.9, s = d/(2-max-min) = 1 -> 100%
    expect(describeColor('#ffcccc')).toContain('hsl(0, 100%, 90%)');
  });

  it('embeds the parsed RGB channels in the RGB line', () => {
    expect(describeColor('#1a2b3c')).toContain('rgb(26, 43, 60)');
  });

  it('is deterministic for the same input', () => {
    expect(describeColor('#123456')).toBe(describeColor('#123456'));
  });

  it('produces hue in the 0..360 range for arbitrary colors', () => {
    const out = describeColor('#3a7bd5');
    const match = out.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
    expect(match).not.toBeNull();
    const [, h, s, l] = match!.map(Number);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(360);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
    expect(l).toBeGreaterThanOrEqual(0);
    expect(l).toBeLessThanOrEqual(100);
  });
});

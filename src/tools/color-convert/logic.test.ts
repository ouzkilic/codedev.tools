import { describe, it, expect } from 'vitest';
import { colorConvertLogic } from './logic';

const conv = (s: string) => colorConvertLogic.transform(s);

/** Helper: pull a single labelled line value out of the formatted output. */
const line = (out: string, label: string): string => {
  const row = out.split('\n').find((l) => l.startsWith(label));
  if (!row) throw new Error(`No line for label ${label}`);
  return row.slice(label.length).trim();
};

describe('colorConvert', () => {
  // ---- existing happy paths (kept) ----
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

  // ---- output structure / determinism ----
  it('emits exactly five labelled lines in order', () => {
    const lines = conv('#ff0000').split('\n');
    expect(lines).toHaveLength(5);
    expect(lines[0].startsWith('HEX:')).toBe(true);
    expect(lines[1].startsWith('RGB:')).toBe(true);
    expect(lines[2].startsWith('HSL:')).toBe(true);
    expect(lines[3].startsWith('HSV:')).toBe(true);
    expect(lines[4].startsWith('CMYK:')).toBe(true);
  });
  it('is deterministic for identical input', () => {
    expect(conv('#3498db')).toEqual(conv('#3498db'));
  });

  // ---- full conversion of pure green (0,255,0) ----
  it('fully converts pure green', () => {
    const out = conv('#00ff00');
    expect(line(out, 'HEX:')).toBe('#00ff00');
    expect(line(out, 'RGB:')).toBe('rgb(0, 255, 0)');
    expect(line(out, 'HSL:')).toBe('hsl(120, 100%, 50%)');
    expect(line(out, 'HSV:')).toBe('hsv(120, 100%, 100%)');
    expect(line(out, 'CMYK:')).toBe('cmyk(100%, 0%, 100%, 0%)');
  });

  // ---- full conversion of pure blue (0,0,255) ----
  it('fully converts pure blue', () => {
    const out = conv('#0000ff');
    expect(line(out, 'HSL:')).toBe('hsl(240, 100%, 50%)');
    expect(line(out, 'HSV:')).toBe('hsv(240, 100%, 100%)');
    expect(line(out, 'CMYK:')).toBe('cmyk(100%, 100%, 0%, 0%)');
  });

  // ---- black: CMYK k===1 short-circuit branch ----
  it('handles pure black (k=1 cmyk branch)', () => {
    const out = conv('#000000');
    expect(line(out, 'HEX:')).toBe('#000000');
    expect(line(out, 'HSL:')).toBe('hsl(0, 0%, 0%)');
    expect(line(out, 'HSV:')).toBe('hsv(0, 0%, 0%)');
    expect(line(out, 'CMYK:')).toBe('cmyk(0%, 0%, 0%, 100%)');
  });

  // ---- white: l===1 / saturation-zero branches ----
  it('handles pure white', () => {
    const out = conv('#ffffff');
    expect(line(out, 'HEX:')).toBe('#ffffff');
    expect(line(out, 'HSL:')).toBe('hsl(0, 0%, 100%)');
    expect(line(out, 'HSV:')).toBe('hsv(0, 0%, 100%)');
    expect(line(out, 'CMYK:')).toBe('cmyk(0%, 0%, 0%, 0%)');
  });

  // ---- mid gray: d===0 (achromatic) for hsl/hsv, cmyk k between 0 and 1 ----
  it('handles mid gray (achromatic, partial k)', () => {
    const out = conv('#808080'); // 128
    expect(line(out, 'HSL:')).toBe('hsl(0, 0%, 50%)');
    expect(line(out, 'HSV:')).toBe('hsv(0, 0%, 50%)');
    expect(line(out, 'CMYK:')).toBe('cmyk(0%, 0%, 0%, 50%)');
  });

  // ---- shorthand expansion correctness ----
  it('expands #abc to #aabbcc with correct rgb', () => {
    const out = conv('#abc');
    expect(line(out, 'HEX:')).toBe('#aabbcc');
    expect(line(out, 'RGB:')).toBe('rgb(170, 187, 204)'); // aa, bb, cc
  });

  // ---- hex accepted without leading # (3 and 6 digits) ----
  it('accepts bare 6-digit hex without #', () => {
    expect(line(conv('ff0000'), 'HEX:')).toBe('#ff0000');
  });
  it('accepts bare 3-digit hex without #', () => {
    expect(line(conv('fff'), 'HEX:')).toBe('#ffffff');
  });

  // ---- case insensitivity + trimming ----
  it('is case-insensitive and trims input', () => {
    expect(line(conv('  #FF0000  '), 'HEX:')).toBe('#ff0000');
  });

  // ---- rgb() / rgba() parsing ----
  it('parses rgb() with spaces', () => {
    expect(line(conv('rgb(  18 ,  52 , 86 )'), 'HEX:')).toBe('#123456');
  });
  it('parses rgba() ignoring alpha', () => {
    expect(line(conv('rgba(255, 0, 0, 0.5)'), 'RGB:')).toBe('rgb(255, 0, 0)');
  });
  it('rejects rgb channel above 255', () => {
    expect(() => conv('rgb(300, 0, 0)')).toThrow(/0.255/);
  });
  it('accepts rgb channel exactly 255 (boundary)', () => {
    expect(line(conv('rgb(255, 255, 255)'), 'HEX:')).toBe('#ffffff');
  });

  // ---- hsl() parsing, including achromatic s=0 grayscale branch ----
  it('parses hsl() with zero saturation as gray', () => {
    // ss === 0 branch in hslToRgb: v = round(l * 255)
    expect(line(conv('hsl(0, 0%, 50%)'), 'HEX:')).toBe('#808080'); // round(0.5*255)=128=0x80
  });
  it('parses hsla() ignoring alpha', () => {
    expect(line(conv('hsla(120, 100%, 50%, 0.3)'), 'HEX:')).toBe('#00ff00');
  });

  // ---- round trips ----
  it('round-trips hex -> rgb -> hex', () => {
    const out = conv('#123456');
    const rgb = line(out, 'RGB:');
    expect(line(conv(rgb), 'HEX:')).toBe('#123456');
  });
  it('round-trips primary hsl back through hex', () => {
    expect(line(conv('hsl(120, 100%, 50%)'), 'HEX:')).toBe('#00ff00');
  });

  // ---- error paths ----
  it('throws on empty string', () => {
    expect(() => conv('')).toThrow();
  });
  it('throws on whitespace-only string', () => {
    expect(() => conv('   ')).toThrow(/Unrecognized/);
  });
  it('throws on malformed hex length (#12)', () => {
    expect(() => conv('#12')).toThrow(/Invalid hex/);
  });
  it('throws on hex with non-hex characters', () => {
    expect(() => conv('#gggggg')).toThrow(/Invalid hex/);
  });
  it('throws on unrecognized format with helpful message', () => {
    expect(() => conv('hello world')).toThrow(/Unrecognized color/);
  });
});

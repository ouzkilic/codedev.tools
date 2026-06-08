import type { ToolLogic } from '@/hooks/useToolState';

interface Rgb { r: number; g: number; b: number; }

function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error('Invalid hex color.');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hh = h / 360, ss = s / 100, ll = l / 100;
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

function rgbToHsv({ r, g, b }: Rgb): { h: number; s: number; v: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0));
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}

function rgbToCmyk({ r, g, b }: Rgb): { c: number; m: number; y: number; k: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function parseColor(input: string): Rgb {
  const s = input.trim().toLowerCase();
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const rgb = { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
    if ([rgb.r, rgb.g, rgb.b].some((v) => v > 255)) throw new Error('RGB values must be 0–255.');
    return rgb;
  }
  const hslMatch = s.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/);
  if (hslMatch) return hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
  if (s.startsWith('#') || /^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(s)) return hexToRgb(s);
  throw new Error('Unrecognized color. Use #hex, rgb(…), or hsl(…).');
}

export const colorConvertLogic: ToolLogic = {
  transform(input: string): string {
    const rgb = parseColor(input);
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    const cmyk = rgbToCmyk(rgb);
    return [
      `HEX:   ${rgbToHex(rgb)}`,
      `RGB:   rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      `HSL:   hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      `HSV:   hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      `CMYK:  cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    ].join('\n');
  },
};

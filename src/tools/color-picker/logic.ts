export interface Rgb { r: number; g: number; b: number; }

export function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '');
  if (h.length === 3 && /^[0-9a-fA-F]{3}$/.test(h)) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (!/^[0-9a-fA-F]{6}/.test(h)) {
    throw new Error(`Geçersiz HEX renk: "${hex}". Örnek: #ff0000 veya #fff`);
  }
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
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

export function describeColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return [
    `HEX:  ${hex.toLowerCase()}`,
    `RGB:  rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    `HSL:  hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  ].join('\n');
}

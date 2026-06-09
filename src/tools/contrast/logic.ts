import type { ToolLogic } from '@/hooks/useToolState';

interface Rgb { r: number; g: number; b: number; }

function parseColor(input: string): Rgb {
  const s = input.trim().toLowerCase();
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const clamp = (n: number) => Math.min(255, Math.max(0, n));
    return { r: clamp(+rgbMatch[1]), g: clamp(+rgbMatch[2]), b: clamp(+rgbMatch[3]) };
  }
  let h = s.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/.test(h)) throw new Error(`Invalid color: ${input}`);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const f = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(parseColor(fg));
  const l2 = relativeLuminance(parseColor(bg));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export const contrastLogic: ToolLogic = {
  secondary: { label: 'Background color', placeholder: '#ffffff' },
  transform(input, ctx) {
    const ratio = contrastRatio(input, ctx?.secondary ?? '');
    const r = Math.round(ratio * 100) / 100;
    const pass = (min: number) => (ratio >= min ? '✓ Pass' : '✗ Fail');
    return [
      `Contrast ratio: ${r}:1`,
      '',
      `AA  (normal text, ≥ 4.5): ${pass(4.5)}`,
      `AA  (large text,  ≥ 3.0): ${pass(3)}`,
      `AAA (normal text, ≥ 7.0): ${pass(7)}`,
      `AAA (large text,  ≥ 4.5): ${pass(4.5)}`,
    ].join('\n');
  },
};

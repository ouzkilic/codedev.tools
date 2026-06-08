import type { ToolLogic } from '@/hooks/useToolState';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export const aspectRatioLogic: ToolLogic = {
  transform(input: string): string {
    const trimmed = input.trim();
    const parts = trimmed.split(/[xX:]/);
    if (parts.length !== 2) {
      throw new Error('Use format like 1920x1080 (separator x, X or :).');
    }
    const w = Number(parts[0].trim());
    const h = Number(parts[1].trim());
    if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
      throw new Error('Width and height must be positive integers.');
    }
    const divisor = gcd(w, h);
    const ratio = `${w / divisor}:${h / divisor}`;
    const decimal = (w / h).toFixed(4);
    return `Ratio: ${ratio}\nDecimal: ${decimal}`;
  },
};

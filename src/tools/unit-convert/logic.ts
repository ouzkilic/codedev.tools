import type { ToolLogic } from '@/hooks/useToolState';

const LENGTH: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const MASS: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

const TEMP = new Set(['c', 'f', 'k']);

function toCelsius(value: number, unit: string): number {
  if (unit === 'c') return value;
  if (unit === 'f') return (value - 32) * (5 / 9);
  return value - 273.15;
}

function fromCelsius(value: number, unit: string): number {
  if (unit === 'c') return value;
  if (unit === 'f') return value * (9 / 5) + 32;
  return value + 273.15;
}

function sigDigits(value: number, digits: number): number {
  if (value === 0) return 0;
  return Number(value.toPrecision(digits));
}

export const unitConvertLogic: ToolLogic = {
  options: [
    { key: 'from', label: 'From', type: 'text', placeholder: 'km', default: 'km' },
    { key: 'to', label: 'To', type: 'text', placeholder: 'mi', default: 'mi' },
  ],
  transform(input: string, ctx): string {
    const value = parseFloat(input);
    if (Number.isNaN(value)) throw new Error('Invalid number.');

    const from = String(ctx?.options.from ?? 'km').trim().toLowerCase();
    const to = String(ctx?.options.to ?? 'mi').trim().toLowerCase();

    let result: number;

    if (from in LENGTH && to in LENGTH) {
      result = (value * LENGTH[from]) / LENGTH[to];
    } else if (from in MASS && to in MASS) {
      result = (value * MASS[from]) / MASS[to];
    } else if (TEMP.has(from) && TEMP.has(to)) {
      result = fromCelsius(toCelsius(value, from), to);
    } else {
      throw new Error('Cannot convert between different unit types.');
    }

    return String(sigDigits(result, 6));
  },
};

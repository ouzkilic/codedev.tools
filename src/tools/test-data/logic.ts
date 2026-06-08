import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const TESTDATA_OPTIONS: ToolOption[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    choices: [
      { value: 'credit-card', label: 'Credit Card' },
      { value: 'iban', label: 'IBAN' },
    ],
    default: 'credit-card',
  },
  { key: 'count', label: 'Count', type: 'text', default: '5', placeholder: '5' },
];

function clampCount(raw: ToolOptions['count']): number {
  const n = parseInt(String(raw ?? '1'), 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(Math.max(n, 1), 100);
}

function randomDigit(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % 10;
}

/** Standard Luhn check over a digit string. */
export function isLuhnValid(num: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = num.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return num.length > 0 && sum % 10 === 0;
}

function luhnCheckDigit(partial: string): number {
  // partial is the first 15 digits; check digit is in an even (doubling) position.
  let sum = 0;
  let double = true;
  for (let i = partial.length - 1; i >= 0; i--) {
    let d = partial.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return (10 - (sum % 10)) % 10;
}

function generateCreditCard(): string {
  let digits = '4';
  for (let i = 0; i < 14; i++) digits += String(randomDigit());
  return digits + String(luhnCheckDigit(digits));
}

function generateIban(): string {
  const check = String(randomDigit()) + String(randomDigit());
  let rest = '';
  for (let i = 0; i < 18; i++) rest += String(randomDigit());
  return 'DE' + check + rest;
}

export function buildTestData(options: ToolOptions): string {
  const n = clampCount(options.count);
  const type = String(options.type ?? 'credit-card');
  const gen = type === 'iban' ? generateIban : generateCreditCard;
  return Array.from({ length: n }, () => gen()).join('\n');
}

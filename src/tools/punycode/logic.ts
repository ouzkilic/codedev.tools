import type { ToolLogic } from '@/hooks/useToolState';

// RFC 3492 Punycode parameters
const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const DELIMITER = '-';
const MAX_INT = 0x7fffffff;

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2);
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > Math.floor(((BASE - TMIN) * TMAX) / 2)) {
    d = Math.floor(d / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * d) / (d + SKEW));
}

function digitToBasic(digit: number): number {
  // 0..25 -> 'a'..'z'; 26..35 -> '0'..'9'
  return digit + 22 + (digit < 26 ? 75 : 0);
}

function basicToDigit(codePoint: number): number {
  if (codePoint - 48 < 10) return codePoint - 22; // '0'..'9' -> 26..35
  if (codePoint - 65 < 26) return codePoint - 65; // 'A'..'Z' -> 0..25
  if (codePoint - 97 < 26) return codePoint - 97; // 'a'..'z' -> 0..25
  return BASE;
}

function ucs2decode(str: string): number[] {
  return Array.from(str, (ch) => ch.codePointAt(0) as number);
}

function ucs2encode(codePoints: number[]): string {
  return String.fromCodePoint(...codePoints);
}

function punycodeEncode(input: string): string {
  const codePoints = ucs2decode(input);
  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;
  const output: string[] = [];

  for (const cp of codePoints) {
    if (cp < 0x80) output.push(String.fromCharCode(cp));
  }

  const basicLength = output.length;
  let handled = basicLength;
  if (basicLength > 0) output.push(DELIMITER);

  while (handled < codePoints.length) {
    let m = MAX_INT;
    for (const cp of codePoints) {
      if (cp >= n && cp < m) m = cp;
    }

    if (m - n > Math.floor((MAX_INT - delta) / (handled + 1))) {
      throw new Error('Punycode overflow during encoding.');
    }
    delta += (m - n) * (handled + 1);
    n = m;

    for (const cp of codePoints) {
      if (cp < n && ++delta > MAX_INT) {
        throw new Error('Punycode overflow during encoding.');
      }
      if (cp === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
          if (q < t) break;
          const qMinusT = q - t;
          const baseMinusT = BASE - t;
          output.push(String.fromCharCode(digitToBasic(t + (qMinusT % baseMinusT))));
          q = Math.floor(qMinusT / baseMinusT);
        }
        output.push(String.fromCharCode(digitToBasic(q)));
        bias = adapt(delta, handled + 1, handled === basicLength);
        delta = 0;
        handled++;
      }
    }
    delta++;
    n++;
  }

  return output.join('');
}

function punycodeDecode(input: string): string {
  const output: number[] = [];
  const inputLength = input.length;
  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;

  let basic = input.lastIndexOf(DELIMITER);
  if (basic < 0) basic = 0;

  for (let j = 0; j < basic; j++) {
    const code = input.charCodeAt(j);
    if (code >= 0x80) throw new Error('Invalid Punycode: non-ASCII in basic segment.');
    output.push(code);
  }

  let index = basic > 0 ? basic + 1 : 0;

  while (index < inputLength) {
    const oldi = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= inputLength) throw new Error('Invalid Punycode: unexpected end of input.');
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= BASE) throw new Error('Invalid Punycode digit.');
      if (digit > Math.floor((MAX_INT - i) / w)) {
        throw new Error('Punycode overflow during decoding.');
      }
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      const baseMinusT = BASE - t;
      if (w > Math.floor(MAX_INT / baseMinusT)) {
        throw new Error('Punycode overflow during decoding.');
      }
      w *= baseMinusT;
    }

    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi === 0);

    if (Math.floor(i / out) > MAX_INT - n) {
      throw new Error('Punycode overflow during decoding.');
    }
    n += Math.floor(i / out);
    i %= out;

    output.splice(i++, 0, n);
  }

  return ucs2encode(output);
}

function hasNonAscii(str: string): boolean {
  for (const ch of str) {
    if ((ch.codePointAt(0) as number) >= 0x80) return true;
  }
  return false;
}

function encodeHost(host: string): string {
  return host
    .split('.')
    .map((label) => (hasNonAscii(label) ? 'xn--' + punycodeEncode(label) : label))
    .join('.');
}

function decodeHost(host: string): string {
  return host
    .split('.')
    .map((label) =>
      label.toLowerCase().startsWith('xn--') ? punycodeDecode(label.slice(4)) : label,
    )
    .join('.');
}

export const punycodeLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
    },
  ],
  transform(input, ctx) {
    const mode = String(ctx?.options.mode ?? 'encode');
    return mode === 'decode' ? decodeHost(input) : encodeHost(input);
  },
};

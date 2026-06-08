import type { ToolLogic } from '@/hooks/useToolState';

const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k]),
);

function encode(input: string): string {
  return input
    .toUpperCase()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) =>
      word
        .split('')
        .map((ch) => MORSE_MAP[ch])
        .filter((code): code is string => Boolean(code))
        .join(' '),
    )
    .filter((word) => word.length > 0)
    .join(' / ');
}

function decode(input: string): string {
  return input
    .trim()
    .split(' / ')
    .map((word) =>
      word
        .trim()
        .split(' ')
        .filter((token) => token.length > 0)
        .map((token) => {
          const ch = REVERSE_MAP[token];
          if (ch === undefined) throw new Error(`Invalid Morse token: ${token}`);
          return ch;
        })
        .join(''),
    )
    .join(' ');
}

export const morseLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
      default: 'encode',
    },
  ],
  transform(input: string, ctx): string {
    if (!input.trim()) return '';
    const mode = String(ctx?.options.mode ?? 'encode');
    return mode === 'decode' ? decode(input) : encode(input);
  },
};

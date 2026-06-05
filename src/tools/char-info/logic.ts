import type { ToolLogic } from '@/hooks/useToolState';

export const charInfoLogic: ToolLogic = {
  transform(input: string): string {
    const raw = input.trim();
    let code: number | undefined;
    if (/^0x[0-9a-f]+$/i.test(raw)) code = parseInt(raw.slice(2), 16);
    else if (/^\d+$/.test(raw)) code = parseInt(raw, 10);
    else code = [...raw][0]?.codePointAt(0);

    if (code === undefined || Number.isNaN(code)) {
      throw new Error('Enter a character, a decimal code, or 0x-prefixed hex.');
    }

    const char = String.fromCodePoint(code);
    return [
      `Character:  ${char}`,
      `Decimal:    ${code}`,
      `Hex:        0x${code.toString(16).toUpperCase()}`,
      `Octal:      0o${code.toString(8)}`,
      `Binary:     ${code.toString(2)}`,
      `HTML:       &#${code};`,
      `Unicode:    U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
    ].join('\n');
  },
};

import type { ToolLogic } from '@/hooks/useToolState';

const NAMED: Record<string, number> = {
  enter: 13, tab: 9, escape: 27, esc: 27, space: 32, backspace: 8, delete: 46,
  arrowup: 38, arrowdown: 40, arrowleft: 37, arrowright: 39, shift: 16,
  control: 17, ctrl: 17, alt: 18, capslock: 20, home: 36, end: 35,
};

export const keycodeLogic: ToolLogic = {
  transform(input: string): string {
    const k = input.trim();
    if (!k) return '';
    const lower = k.toLowerCase();
    let code: number;
    if (lower in NAMED) code = NAMED[lower];
    else if (k.length === 1) code = k.toUpperCase().charCodeAt(0);
    else throw new Error('Unknown key: ' + k);
    return 'Key: ' + k + '\nkeyCode: ' + code;
  },
};

import type { ToolLogic } from '@/hooks/useToolState';

export const basicAuthLogic: ToolLogic = {
  secondary: { label: 'Password', placeholder: 'password' },
  transform(input, ctx) {
    const user = input.trim();
    const pass = ctx?.secondary ?? '';
    const bytes = new TextEncoder().encode(user + ':' + pass);
    let bin = '';
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    const token = btoa(bin);
    return 'Authorization: Basic ' + token;
  },
};

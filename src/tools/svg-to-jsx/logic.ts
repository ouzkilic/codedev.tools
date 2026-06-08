import type { ToolLogic } from '@/hooks/useToolState';

function toJsx(input: string): string {
  return input
    .replace(/(\s)([a-zA-Z]+)-([a-zA-Z]+)=/g, (_m, ws: string, a: string, b: string) =>
      `${ws}${a}${b.charAt(0).toUpperCase()}${b.slice(1)}=`,
    )
    .replace(/\bclass=/g, 'className=');
}

export const svgToJsxLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'jsx',
      choices: [
        { value: 'jsx', label: 'JSX' },
        { value: 'datauri', label: 'Data URI' },
      ],
    },
  ],
  transform(input: string, ctx): string {
    const mode = String(ctx?.options.mode ?? 'jsx');
    if (mode === 'datauri') {
      return 'data:image/svg+xml,' + encodeURIComponent(input.trim());
    }
    return toJsx(input);
  },
};

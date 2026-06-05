import type { ToolLogic } from '@/hooks/useToolState';

export const whitespaceLogic: ToolLogic = {
  options: [
    { key: 'trimLines', label: 'Trim lines', type: 'toggle', default: true },
    { key: 'collapse', label: 'Collapse spaces', type: 'toggle', default: false },
    { key: 'removeEmpty', label: 'Remove empty lines', type: 'toggle', default: false },
  ],
  transform(input, ctx) {
    const trimLines = Boolean(ctx?.options.trimLines);
    const collapse = Boolean(ctx?.options.collapse);
    const removeEmpty = Boolean(ctx?.options.removeEmpty);

    let lines = input.split('\n');
    if (collapse) lines = lines.map((l) => l.replace(/[ \t]{2,}/g, ' '));
    if (trimLines) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l.trim().length > 0);
    return lines.join('\n');
  },
};

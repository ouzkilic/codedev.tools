import type { ToolLogic } from '@/hooks/useToolState';

export const findReplaceLogic: ToolLogic = {
  options: [
    { key: 'find', label: 'Find', type: 'text', default: '', placeholder: 'search' },
    { key: 'replace', label: 'Replace', type: 'text', default: '', placeholder: 'replacement' },
    { key: 'regex', label: 'Regex', type: 'toggle', default: false },
    { key: 'ci', label: 'Ignore case', type: 'toggle', default: false },
  ],
  transform(input, ctx) {
    const find = String(ctx?.options.find ?? '');
    const replace = String(ctx?.options.replace ?? '');
    if (!find) return input;

    if (ctx?.options.regex) {
      const flags = 'g' + (ctx.options.ci ? 'i' : '');
      let re: RegExp;
      try {
        re = new RegExp(find, flags);
      } catch (e) {
        throw new Error(`Invalid regex: ${e instanceof Error ? e.message : 'error'}`, { cause: e });
      }
      return input.replace(re, replace);
    }

    if (ctx?.options.ci) {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return input.replace(new RegExp(escaped, 'gi'), replace);
    }
    return input.split(find).join(replace);
  },
};

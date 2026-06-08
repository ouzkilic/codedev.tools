import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const pascal = (s: string) =>
  (s.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Item');

const singular = (s: string) => (s.endsWith('s') ? s.slice(0, -1) : s);

interface Ctx {
  types: Map<string, string>;
  used: Set<string>;
}

function uniqueName(base: string, ctx: Ctx): string {
  let name = base;
  let i = 2;
  while (ctx.used.has(name)) name = `${base}${i++}`;
  ctx.used.add(name);
  return name;
}

function gqlType(value: Json, nameHint: string, ctx: Ctx): string {
  if (value === null) return 'String';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[String]';
    return `[${gqlType(value[0], singular(nameHint), ctx)}]`;
  }
  switch (typeof value) {
    case 'string': return 'String';
    case 'number': return Number.isInteger(value) ? 'Int' : 'Float';
    case 'boolean': return 'Boolean';
    default: {
      const name = uniqueName(pascal(nameHint), ctx);
      // Reserve this type's slot before recursing so parents stay ahead of nested types.
      ctx.types.set(name, '');
      const entries = Object.entries(value as { [k: string]: Json });
      const body = `type ${name} {\n` +
        entries.map(([k, v]) => `  ${k}: ${gqlType(v, k, ctx)}`).join('\n') +
        '\n}';
      ctx.types.set(name, body);
      return name;
    }
  }
}

export const jsonToGraphqlLogic: ToolLogic = {
  transform(input: string): string {
    const data: Json = JSON.parse(input);
    const ctx: Ctx = { types: new Map(), used: new Set() };
    gqlType(data, 'Root', ctx);
    // Root is registered first, so its insertion order already puts it first.
    return [...ctx.types.values()].join('\n\n');
  },
};

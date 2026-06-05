import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const pascal = (s: string) =>
  (s.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Item');

const singular = (s: string) => (s.endsWith('s') ? s.slice(0, -1) : s);

const isValidKey = (k: string) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);

interface Ctx {
  interfaces: Map<string, string>;
  used: Set<string>;
}

function uniqueName(base: string, ctx: Ctx): string {
  let name = base;
  let i = 2;
  while (ctx.used.has(name)) name = `${base}${i++}`;
  ctx.used.add(name);
  return name;
}

function tsType(value: Json, nameHint: string, ctx: Ctx): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    return `${tsType(value[0], singular(nameHint), ctx)}[]`;
  }
  switch (typeof value) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    default: {
      const name = uniqueName(pascal(nameHint), ctx);
      const entries = Object.entries(value as { [k: string]: Json });
      const body = entries.length === 0
        ? 'export interface ' + name + ' {}'
        : `export interface ${name} {\n` +
          entries.map(([k, v]) => {
            const key = isValidKey(k) ? k : JSON.stringify(k);
            return `  ${key}: ${tsType(v, k, ctx)};`;
          }).join('\n') +
          '\n}';
      ctx.interfaces.set(name, body);
      return name;
    }
  }
}

export const jsonToTsLogic: ToolLogic = {
  transform(input: string): string {
    const data = JSON.parse(input);
    const ctx: Ctx = { interfaces: new Map(), used: new Set() };

    // Plain object root → just emit interfaces (root interface first).
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
      tsType(data, 'Root', ctx);
      return [...ctx.interfaces.values()].reverse().join('\n\n');
    }

    // Array / primitive root → emit a `Root` type alias (+ any element interfaces).
    const rootType = Array.isArray(data)
      ? data.length === 0
        ? 'unknown[]'
        : `${tsType(data[0], 'RootItem', ctx)}[]`
      : tsType(data, 'Root', ctx);

    const defs = [...ctx.interfaces.values()].reverse();
    defs.unshift(`export type Root = ${rootType};`);
    return defs.join('\n\n');
  },
};

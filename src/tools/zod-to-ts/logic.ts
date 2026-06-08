import type { ToolLogic } from '@/hooks/useToolState';

interface Field {
  name: string;
  type: string;
  optional: boolean;
}

/** Find the body inside `z.object(` ... `)` starting at the given index of `(`. */
function readBalanced(src: string, openIndex: number): { body: string; end: number } {
  let depth = 0;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) return { body: src.slice(openIndex + 1, i), end: i };
    }
  }
  throw new Error('Unbalanced parentheses in Zod schema.');
}

/** Split a brace-object body into top-level `key: value` entries. */
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(body.slice(start));
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

/** Convert a Zod type expression (without trailing modifiers) into a TS type string. */
function zodToTsType(expr: string): string {
  const trimmed = expr.trim();

  const objIdx = trimmed.indexOf('z.object(');
  if (objIdx === 0) {
    const open = trimmed.indexOf('(', objIdx);
    const { body } = readBalanced(trimmed, open);
    return renderObject(parseFields(body));
  }

  if (trimmed.startsWith('z.array(')) {
    const open = trimmed.indexOf('(');
    const { body } = readBalanced(trimmed, open);
    return `${zodToTsType(stripModifiers(body).base)}[]`;
  }

  if (trimmed.startsWith('z.enum(')) {
    const open = trimmed.indexOf('(');
    const { body } = readBalanced(trimmed, open);
    const inner = body.trim().replace(/^\[/, '').replace(/\]$/, '');
    const members = splitTopLevel(inner)
      .map((m) => m.trim())
      .filter((m) => m.length > 0)
      .map((m) => `'${m.replace(/^['"`]|['"`]$/g, '')}'`);
    if (members.length === 0) throw new Error('z.enum() requires at least one value.');
    return members.join(' | ');
  }

  if (trimmed.startsWith('z.string()')) return 'string';
  if (trimmed.startsWith('z.number()')) return 'number';
  if (trimmed.startsWith('z.boolean()')) return 'boolean';

  throw new Error(`Unsupported Zod type: ${trimmed}`);
}

/** Separate a field value into its base expression and whether it is optional. */
function stripModifiers(value: string): { base: string; optional: boolean } {
  const optional = /\.(optional|nullish)\s*\(\s*\)/.test(value);
  return { base: value.trim(), optional };
}

function parseFields(objectBody: string): Field[] {
  const inner = objectBody.trim().replace(/^\{/, '').replace(/\}$/, '');
  const entries = splitTopLevel(inner);
  const fields: Field[] = [];
  for (const entry of entries) {
    const colon = entry.indexOf(':');
    if (colon === -1) continue;
    const name = entry.slice(0, colon).trim().replace(/^['"`]|['"`]$/g, '');
    const value = entry.slice(colon + 1).trim();
    const { base, optional } = stripModifiers(value);
    fields.push({ name, type: zodToTsType(base), optional });
  }
  return fields;
}

function renderObject(fields: Field[]): string {
  const lines = fields.map((f) => `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`);
  return `{\n${lines.join('\n')}\n}`;
}

export const zodToTsLogic: ToolLogic = {
  transform(input: string): string {
    const objIdx = input.indexOf('z.object(');
    if (objIdx === -1) throw new Error('No z.object(...) schema found in input.');

    const open = input.indexOf('(', objIdx);
    let body: string;
    try {
      body = readBalanced(input, open).body;
    } catch (e) {
      throw new Error('Failed to parse Zod schema.', { cause: e });
    }

    const fields = parseFields(body);
    if (fields.length === 0) throw new Error('No fields found in z.object schema.');

    const lines = fields.map((f) => `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`);
    return `export interface Schema {\n${lines.join('\n')}\n}`;
  },
};

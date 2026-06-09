import type { ToolLogic } from '@/hooks/useToolState';

interface JsonSchema {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
}

interface GeneratedInterface {
  name: string;
  body: string;
}

function pascalCase(key: string): string {
  const parts = key.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length === 0) return 'Field';
  const joined = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return /^[0-9]/.test(joined) ? `_${joined}` : joined;
}

function uniqueName(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}${i}`)) i++;
  const name = `${base}${i}`;
  used.add(name);
  return name;
}

function mapType(
  key: string,
  schema: JsonSchema,
  nested: GeneratedInterface[],
  used: Set<string>,
): string {
  if (Array.isArray(schema.enum)) {
    if (schema.enum.every((v) => typeof v === 'string')) {
      return schema.enum.map((v) => `'${v as string}'`).join(' | ');
    }
  }

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'array': {
      const itemType = schema.items
        ? mapType(key, schema.items, nested, used)
        : 'unknown';
      return `${itemType}[]`;
    }
    case 'object':
    default:
      if (schema.properties) {
        const name = uniqueName(pascalCase(key), used);
        buildInterface(name, schema, nested, used);
        return name;
      }
      return 'unknown';
  }
}

function buildInterface(
  name: string,
  schema: JsonSchema,
  nested: GeneratedInterface[],
  used: Set<string>,
): void {
  const required = new Set(schema.required ?? []);
  const props = schema.properties ?? {};
  const lines: string[] = [];

  for (const [key, propSchema] of Object.entries(props)) {
    const optional = required.has(key) ? '' : '?';
    const tsType = mapType(key, propSchema, nested, used);
    lines.push(`  ${key}${optional}: ${tsType};`);
  }

  const body = `export interface ${name} {\n${lines.join('\n')}\n}`;
  nested.push({ name, body });
}

export const jsonSchemaToTsLogic: ToolLogic = {
  transform(input: string): string {
    let schema: JsonSchema;
    try {
      schema = JSON.parse(input) as JsonSchema;
    } catch (e) {
      throw new Error('Invalid JSON input', { cause: e });
    }

    if (typeof schema !== 'object' || schema === null) {
      throw new Error('JSON Schema must be an object');
    }

    const nested: GeneratedInterface[] = [];
    const used = new Set<string>(['Root']);
    buildInterface('Root', schema, nested, used);

    // 'Root' was pushed last by buildInterface; emit it first, then the rest.
    const root = nested.find((i) => i.name === 'Root');
    const rest = nested.filter((i) => i.name !== 'Root');
    const ordered = root ? [root, ...rest] : rest;

    return ordered.map((i) => i.body).join('\n\n');
  },
};

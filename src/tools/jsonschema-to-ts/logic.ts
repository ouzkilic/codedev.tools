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

function mapType(
  key: string,
  schema: JsonSchema,
  nested: GeneratedInterface[],
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
        ? mapType(key, schema.items, nested)
        : 'unknown';
      return `${itemType}[]`;
    }
    case 'object':
    default:
      if (schema.properties) {
        const name = pascalCase(key);
        buildInterface(name, schema, nested);
        return name;
      }
      return 'unknown';
  }
}

function buildInterface(
  name: string,
  schema: JsonSchema,
  nested: GeneratedInterface[],
): void {
  const required = new Set(schema.required ?? []);
  const props = schema.properties ?? {};
  const lines: string[] = [];

  for (const [key, propSchema] of Object.entries(props)) {
    const optional = required.has(key) ? '' : '?';
    const tsType = mapType(key, propSchema, nested);
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
    buildInterface('Root', schema, nested);

    // 'Root' was pushed last by buildInterface; emit it first, then the rest.
    const root = nested.find((i) => i.name === 'Root');
    const rest = nested.filter((i) => i.name !== 'Root');
    const ordered = root ? [root, ...rest] : rest;

    return ordered.map((i) => i.body).join('\n\n');
  },
};

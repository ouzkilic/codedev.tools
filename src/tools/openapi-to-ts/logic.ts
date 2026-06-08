import yaml from 'js-yaml';
import type { ToolLogic } from '@/hooks/useToolState';

interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  $ref?: string;
  enum?: unknown[];
  format?: string;
}

function refName(ref: string): string {
  const parts = ref.split('/');
  return parts[parts.length - 1] || 'unknown';
}

function tsType(schema: SchemaObject): string {
  if (schema.$ref) return refName(schema.$ref);
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum
      .map((v) => (typeof v === 'string' ? JSON.stringify(v) : String(v)))
      .join(' | ');
  }
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return schema.items ? `${tsType(schema.items)}[]` : 'unknown[]';
    case 'object':
      if (schema.properties) {
        const inner = Object.entries(schema.properties)
          .map(([k, v]) => `${k}: ${tsType(v)}`)
          .join('; ');
        return `{ ${inner} }`;
      }
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

function buildInterface(name: string, schema: SchemaObject): string {
  const required = new Set(schema.required ?? []);
  const props = schema.properties ?? {};
  const lines = Object.entries(props).map(([key, prop]) => {
    const optional = required.has(key) ? '' : '?';
    return `  ${key}${optional}: ${tsType(prop)};`;
  });
  return `export interface ${name} {\n${lines.join('\n')}\n}`;
}

export const openapiToTsLogic: ToolLogic = {
  transform(input: string): string {
    let spec: unknown;
    try {
      spec = JSON.parse(input);
    } catch {
      try {
        spec = yaml.load(input);
      } catch (e) {
        throw new Error('Input is not valid JSON or YAML.', { cause: e });
      }
    }

    if (typeof spec !== 'object' || spec === null) {
      throw new Error('No schemas found (components.schemas or definitions).');
    }

    const root = spec as {
      components?: { schemas?: Record<string, SchemaObject> };
      definitions?: Record<string, SchemaObject>;
    };

    const schemas = root.components?.schemas ?? root.definitions;
    if (!schemas || Object.keys(schemas).length === 0) {
      throw new Error('No schemas found (components.schemas or definitions).');
    }

    return Object.entries(schemas)
      .map(([name, schema]) => buildInterface(name, schema))
      .join('\n\n');
  },
};

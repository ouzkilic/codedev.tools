import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function infer(value: Json): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    return value.length === 0
      ? { type: 'array' }
      : { type: 'array', items: infer(value[0]) };
  }
  switch (typeof value) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' };
    case 'boolean':
      return { type: 'boolean' };
    default: {
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, v] of Object.entries(value as { [k: string]: Json })) {
        properties[key] = infer(v);
        required.push(key);
      }
      return { type: 'object', properties, required };
    }
  }
}

export const jsonToJsonSchemaLogic: ToolLogic = {
  transform(input: string): string {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      ...infer(JSON.parse(input)),
    };
    return JSON.stringify(schema, null, 2);
  },
};

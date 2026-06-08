import type { ToolLogic } from '@/hooks/useToolState';

interface Schema {
  type?: string;
  default?: unknown;
  example?: unknown;
  enum?: unknown[];
  properties?: Record<string, Schema>;
  items?: Schema;
}

function sample(s: Schema | null | undefined): unknown {
  if (!s || typeof s !== 'object') return null;
  if ('default' in s) return s.default;
  if ('example' in s) return s.example;
  if (Array.isArray(s.enum)) return s.enum[0];
  switch (s.type) {
    case 'object': {
      const o: Record<string, unknown> = {};
      const props = s.properties || {};
      for (const k of Object.keys(props)) o[k] = sample(props[k]);
      return o;
    }
    case 'array':
      return [sample(s.items || {})];
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'null':
      return null;
    default:
      return null;
  }
}

export const jsonSchemaToJsonLogic: ToolLogic = {
  transform(input) {
    if (!input.trim()) return '';
    let schema: Schema;
    try {
      schema = JSON.parse(input) as Schema;
    } catch (e) {
      throw new Error('Invalid JSON Schema', { cause: e });
    }
    return JSON.stringify(sample(schema), null, 2);
  },
};

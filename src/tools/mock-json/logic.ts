import type { ToolLogic } from '@/hooks/useToolState';

interface Schema {
  type?: string;
  enum?: unknown[];
  properties?: Record<string, Schema>;
  items?: Schema;
}

const WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];

/** Random integer in [min, max] inclusive, backed by Web Crypto. */
export function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

/** Random float in [0, 1000). */
export function randomFloat(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] / 0xffffffff) * 1000;
}

export function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

/** Recursively build a random instance from a JSON Schema node. */
export function mockValue(s: Schema | null | undefined): unknown {
  if (!s || typeof s !== 'object') return null;
  if (Array.isArray(s.enum) && s.enum.length > 0) return pick(s.enum);

  switch (s.type) {
    case 'object': {
      const out: Record<string, unknown> = {};
      const props = s.properties ?? {};
      for (const key of Object.keys(props)) out[key] = mockValue(props[key]);
      return out;
    }
    case 'array': {
      const count = randomInt(1, 3);
      const arr: unknown[] = [];
      for (let i = 0; i < count; i += 1) arr.push(mockValue(s.items ?? {}));
      return arr;
    }
    case 'string':
      return pick(WORDS);
    case 'integer':
      return randomInt(0, 1000);
    case 'number':
      return randomFloat();
    case 'boolean':
      return randomInt(0, 1) === 1;
    case 'null':
      return null;
    default:
      return null;
  }
}

export const mockJsonLogic: ToolLogic = {
  transform(input) {
    if (!input.trim()) return '';
    let schema: Schema;
    try {
      schema = JSON.parse(input) as Schema;
    } catch (e) {
      throw new Error('Invalid JSON Schema', { cause: e });
    }
    return JSON.stringify(mockValue(schema), null, 2);
  },
};

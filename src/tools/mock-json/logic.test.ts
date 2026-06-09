import { describe, expect, it } from 'vitest';
import { mockJsonLogic, mockValue, pick, randomFloat, randomInt } from './logic';

describe('randomInt', () => {
  it('stays within the inclusive range over many draws', () => {
    for (let i = 0; i < 1000; i += 1) {
      const n = randomInt(5, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(10);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it('returns the single value when min === max', () => {
    for (let i = 0; i < 50; i += 1) expect(randomInt(7, 7)).toBe(7);
  });

  it('supports a zero-based lower bound', () => {
    for (let i = 0; i < 200; i += 1) {
      const n = randomInt(0, 1);
      expect(n === 0 || n === 1).toBe(true);
    }
  });
});

describe('randomFloat', () => {
  it('returns a float within [0, 1000) across many draws', () => {
    for (let i = 0; i < 1000; i += 1) {
      const n = randomFloat();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1000);
      expect(typeof n).toBe('number');
    }
  });
});

describe('pick', () => {
  it('always returns an element of the source array', () => {
    const items = ['x', 'y', 'z'];
    for (let i = 0; i < 200; i += 1) expect(items).toContain(pick(items));
  });

  it('returns the only element for a single-item array', () => {
    expect(pick([42])).toBe(42);
  });
});

describe('mockValue', () => {
  it('returns null for nullish or non-object schemas', () => {
    expect(mockValue(null)).toBeNull();
    expect(mockValue(undefined)).toBeNull();
  });

  it('returns null for an unknown / missing type', () => {
    expect(mockValue({})).toBeNull();
    expect(mockValue({ type: 'mystery' })).toBeNull();
  });

  it('returns null for the explicit null type', () => {
    expect(mockValue({ type: 'null' })).toBeNull();
  });

  it('generates a string from the lorem word list', () => {
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
    for (let i = 0; i < 50; i += 1) expect(words).toContain(mockValue({ type: 'string' }));
  });

  it('generates an integer in [0, 1000]', () => {
    for (let i = 0; i < 200; i += 1) {
      const n = mockValue({ type: 'integer' }) as number;
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(1000);
    }
  });

  it('generates a number in [0, 1000)', () => {
    for (let i = 0; i < 200; i += 1) {
      const n = mockValue({ type: 'number' }) as number;
      expect(typeof n).toBe('number');
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1000);
    }
  });

  it('generates a boolean', () => {
    for (let i = 0; i < 50; i += 1) expect(typeof mockValue({ type: 'boolean' })).toBe('boolean');
  });

  it('prefers a non-empty enum over the declared type', () => {
    for (let i = 0; i < 100; i += 1) {
      expect([1, 2, 3]).toContain(mockValue({ type: 'string', enum: [1, 2, 3] }));
    }
  });

  it('ignores an empty enum and falls back to the type', () => {
    expect(typeof mockValue({ type: 'string', enum: [] })).toBe('string');
  });

  it('builds an object honoring each property type', () => {
    const out = mockValue({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'integer' },
        c: { type: 'boolean' },
      },
    }) as Record<string, unknown>;
    expect(Object.keys(out).sort()).toEqual(['a', 'b', 'c']);
    expect(typeof out.a).toBe('string');
    expect(typeof out.b).toBe('number');
    expect(typeof out.c).toBe('boolean');
  });

  it('returns an empty object for an object schema with no properties', () => {
    expect(mockValue({ type: 'object' })).toEqual({});
  });

  it('produces an array of 1..3 items of the item type', () => {
    for (let i = 0; i < 100; i += 1) {
      const arr = mockValue({ type: 'array', items: { type: 'boolean' } }) as unknown[];
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThanOrEqual(1);
      expect(arr.length).toBeLessThanOrEqual(3);
      for (const item of arr) expect(typeof item).toBe('boolean');
    }
  });

  it('defaults array items to {} (null) when items is omitted', () => {
    const arr = mockValue({ type: 'array' }) as unknown[];
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(1);
    for (const item of arr) expect(item).toBeNull();
  });

  it('handles deeply nested object/array schemas', () => {
    const out = mockValue({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    }) as { user: { tags: unknown[] } };
    expect(Array.isArray(out.user.tags)).toBe(true);
    for (const t of out.user.tags) expect(typeof t).toBe('string');
  });
});

describe('mockJsonLogic.transform', () => {
  it('returns empty string for empty input', () => {
    expect(mockJsonLogic.transform('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(mockJsonLogic.transform('   \n\t  ')).toBe('');
  });

  it('throws "Invalid JSON Schema" on malformed JSON', () => {
    expect(() => mockJsonLogic.transform('{ not valid')).toThrow('Invalid JSON Schema');
  });

  it('pretty-prints output with 2-space indentation', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: { name: { type: 'string' } },
    });
    const result = mockJsonLogic.transform(schema);
    expect(result).toContain('\n');
    expect(result).toMatch(/\n {2}"name":/);
  });

  it('emits valid JSON that round-trips through JSON.parse', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        active: { type: 'boolean' },
        scores: { type: 'array', items: { type: 'number' } },
      },
    });
    const result = mockJsonLogic.transform(schema);
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result) as {
      id: unknown;
      name: unknown;
      active: unknown;
      scores: unknown[];
    };
    expect(typeof parsed.id).toBe('number');
    expect(typeof parsed.name).toBe('string');
    expect(typeof parsed.active).toBe('boolean');
    expect(Array.isArray(parsed.scores)).toBe(true);
  });

  it('generates correctly typed primitives for an object schema', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        ok: { type: 'boolean' },
      },
    });
    const result = JSON.parse(mockJsonLogic.transform(schema)) as {
      id: unknown;
      name: unknown;
      ok: unknown;
    };
    expect(typeof result.id).toBe('number');
    expect(typeof result.name).toBe('string');
    expect(typeof result.ok).toBe('boolean');
  });

  it('generates an array of the items type', () => {
    const schema = JSON.stringify({ type: 'array', items: { type: 'integer' } });
    const result = JSON.parse(mockJsonLogic.transform(schema)) as unknown;
    expect(Array.isArray(result)).toBe(true);
    const arr = result as unknown[];
    expect(arr.length).toBeGreaterThanOrEqual(1);
    expect(arr.length).toBeLessThanOrEqual(3);
    for (const item of arr) expect(typeof item).toBe('number');
  });

  it('picks an enum member', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: { r: { enum: ['a', 'b'] } },
    });
    const result = JSON.parse(mockJsonLogic.transform(schema)) as { r: unknown };
    expect(['a', 'b']).toContain(result.r);
  });

  it('throws on invalid JSON', () => {
    expect(() => mockJsonLogic.transform('{ not valid')).toThrow();
  });

  it('serializes a top-level null schema as the JSON literal null', () => {
    expect(mockJsonLogic.transform('null')).toBe('null');
  });

  it('serializes a primitive string schema to a quoted lorem word', () => {
    const result = mockJsonLogic.transform(JSON.stringify({ type: 'string' }));
    expect(result).toMatch(/^"(lorem|ipsum|dolor|sit|amet)"$/);
  });
});

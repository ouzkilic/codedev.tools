import { describe, expect, it } from 'vitest';
import { mockJsonLogic } from './logic';

describe('mockJsonLogic', () => {
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
});

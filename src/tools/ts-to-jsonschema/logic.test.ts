import { describe, it, expect } from 'vitest';
import { tsToJsonSchemaLogic } from './logic';

describe('tsToJsonSchemaLogic', () => {
  it('maps primitives and optional fields with required list', () => {
    const out = tsToJsonSchemaLogic.transform('interface User { id: number; name?: string; }');
    expect(out).toContain('"$schema": "http://json-schema.org/draft-07/schema#"');
    expect(out).toContain('"id": {');
    expect(out).toContain('"type": "number"');
    expect(out).toContain('"name": {');
    const parsed = JSON.parse(out);
    expect(parsed.properties.id).toEqual({ type: 'number' });
    expect(parsed.properties.name).toEqual({ type: 'string' });
    expect(parsed.required).toEqual(['id']);
  });

  it('maps array types', () => {
    const out = tsToJsonSchemaLogic.transform('interface X { tags: string[] }');
    const parsed = JSON.parse(out);
    expect(parsed.properties.tags).toEqual({ type: 'array', items: { type: 'string' } });
    expect(parsed.required).toEqual(['tags']);
  });

  it('maps Array<T> generics', () => {
    const out = tsToJsonSchemaLogic.transform('interface X { nums: Array<number> }');
    expect(out).toContain('"type": "array"');
    const parsed = JSON.parse(out);
    expect(parsed.properties.nums).toEqual({ type: 'array', items: { type: 'number' } });
  });

  it('maps string-literal unions to enum', () => {
    const out = tsToJsonSchemaLogic.transform("interface X { role: 'admin' | 'user'; }");
    const parsed = JSON.parse(out);
    expect(parsed.properties.role).toEqual({ enum: ['admin', 'user'] });
  });

  it('supports type alias and nested objects', () => {
    const out = tsToJsonSchemaLogic.transform('type T = { meta: { active: boolean } };');
    const parsed = JSON.parse(out);
    expect(parsed.properties.meta.type).toBe('object');
    expect(parsed.properties.meta.properties.active).toEqual({ type: 'boolean' });
  });

  it('throws on empty or junk input', () => {
    expect(() => tsToJsonSchemaLogic.transform('not a schema at all')).toThrow();
  });

  // --- additional coverage ---

  it('maps the boolean primitive', () => {
    const parsed = JSON.parse(tsToJsonSchemaLogic.transform('interface X { ok: boolean }'));
    expect(parsed.properties.ok).toEqual({ type: 'boolean' });
    expect(parsed.required).toEqual(['ok']);
  });

  it('produces a valid draft-07 root schema with object type', () => {
    const parsed = JSON.parse(tsToJsonSchemaLogic.transform('interface X { a: string }'));
    expect(parsed.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(parsed.type).toBe('object');
    expect(parsed).toHaveProperty('properties');
    expect(parsed).toHaveProperty('required');
  });

  it('splits members on commas as well as semicolons', () => {
    const parsed = JSON.parse(tsToJsonSchemaLogic.transform('interface X { a: string, b: number }'));
    expect(parsed.properties.a).toEqual({ type: 'string' });
    expect(parsed.properties.b).toEqual({ type: 'number' });
    expect(parsed.required).toEqual(['a', 'b']);
  });

  it('splits members on newlines', () => {
    const parsed = JSON.parse(
      tsToJsonSchemaLogic.transform('interface X {\n  a: string\n  b: boolean\n}'),
    );
    expect(parsed.properties.a).toEqual({ type: 'string' });
    expect(parsed.properties.b).toEqual({ type: 'boolean' });
  });

  it('handles all-optional members yielding an empty required array', () => {
    const parsed = JSON.parse(tsToJsonSchemaLogic.transform('interface X { a?: string; b?: number }'));
    expect(parsed.properties.a).toEqual({ type: 'string' });
    expect(parsed.properties.b).toEqual({ type: 'number' });
    expect(parsed.required).toEqual([]);
  });

  it('handles an empty interface body', () => {
    const parsed = JSON.parse(tsToJsonSchemaLogic.transform('interface X {}'));
    expect(parsed.type).toBe('object');
    expect(parsed.properties).toEqual({});
    expect(parsed.required).toEqual([]);
  });

  it('maps arrays of objects (T[] with inline object element)', () => {
    const parsed = JSON.parse(
      tsToJsonSchemaLogic.transform('interface X { rows: { v: number }[] }'),
    );
    expect(parsed.properties.rows.type).toBe('array');
    expect(parsed.properties.rows.items.type).toBe('object');
    expect(parsed.properties.rows.items.properties.v).toEqual({ type: 'number' });
  });

  it('maps nested generic arrays Array<Array<string>>', () => {
    const parsed = JSON.parse(
      tsToJsonSchemaLogic.transform('interface X { grid: Array<Array<string>> }'),
    );
    expect(parsed.properties.grid).toEqual({
      type: 'array',
      items: { type: 'array', items: { type: 'string' } },
    });
  });


  it('supports unicode/emoji property names and literal values', () => {
    const parsed = JSON.parse(
      tsToJsonSchemaLogic.transform("interface X { status: ' açık' | 'kapalı🚪' }"),
    );
    expect(parsed.properties.status).toEqual({ enum: [' açık', 'kapalı🚪'] });
  });

  it('throws on an unsupported primitive type', () => {
    expect(() => tsToJsonSchemaLogic.transform('interface X { d: Date }')).toThrow(
      /Unsupported type/,
    );
  });

  it('throws on a non-string-literal union member', () => {
    // contains a quote so the union branch is taken, but `number` is not a quoted literal
    expect(() => tsToJsonSchemaLogic.transform("interface X { v: 'a' | number }")).toThrow(
      /Unsupported union member/,
    );
  });

  it('throws on a member without a type (missing colon)', () => {
    expect(() => tsToJsonSchemaLogic.transform('interface X { a }')).toThrow(/Invalid member/);
  });

  it('throws on a member with an empty name', () => {
    expect(() => tsToJsonSchemaLogic.transform('interface X { : string }')).toThrow(
      /Invalid member name/,
    );
  });

  it('is idempotent in structure for repeated runs (deterministic output)', () => {
    const src = 'interface User { id: number; name?: string; tags: string[] }';
    expect(tsToJsonSchemaLogic.transform(src)).toBe(tsToJsonSchemaLogic.transform(src));
  });

  it('handles a large interface with many members', () => {
    const members = Array.from({ length: 50 }, (_, i) => `f${i}: string`).join('; ');
    const parsed = JSON.parse(tsToJsonSchemaLogic.transform(`interface Big { ${members} }`));
    expect(Object.keys(parsed.properties)).toHaveLength(50);
    expect(parsed.required).toHaveLength(50);
    expect(parsed.properties.f49).toEqual({ type: 'string' });
  });

  it('maps double-quoted string-literal unions to an enum', () => {
    const out = tsToJsonSchemaLogic.transform('interface X { mode: "on" | "off" }');
    expect(JSON.parse(out).properties.mode.enum).toEqual(['on', 'off']);
  });

  it('maps mixed single/double-quoted unions to an enum', () => {
    const out = tsToJsonSchemaLogic.transform("interface X { v: 'a' | \"b\" }");
    expect(JSON.parse(out).properties.v.enum).toEqual(['a', 'b']);
  });
});

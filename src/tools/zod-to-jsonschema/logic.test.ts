import { describe, it, expect } from 'vitest';
import { zodToJsonSchemaLogic } from './logic';

describe('zodToJsonSchema', () => {
  it('maps primitives and handles optional fields', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ id: z.number(), name: z.string().optional() })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.id).toEqual({ type: 'number' });
    expect(schema.properties.name).toEqual({ type: 'string' });
    expect(schema.required).toEqual(['id']);
    expect(out).toContain('draft-07');
  });

  it('maps arrays with item schemas', () => {
    const out = zodToJsonSchemaLogic.transform('z.object({ tags: z.array(z.string()) })');
    const schema = JSON.parse(out);
    expect(schema.properties.tags).toEqual({ type: 'array', items: { type: 'string' } });
    expect(schema.required).toEqual(['tags']);
  });

  it('maps enums and booleans', () => {
    const out = zodToJsonSchemaLogic.transform(
      "z.object({ role: z.enum(['admin', 'user']), active: z.boolean() })",
    );
    const schema = JSON.parse(out);
    expect(schema.properties.role).toEqual({ enum: ['admin', 'user'] });
    expect(schema.properties.active).toEqual({ type: 'boolean' });
  });

  it('handles nested objects', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ user: z.object({ id: z.number() }) })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.user.type).toBe('object');
    expect(schema.properties.user.properties.id).toEqual({ type: 'number' });
    expect(schema.properties.user.required).toEqual(['id']);
  });

  it('throws when there is no z.object', () => {
    expect(() => zodToJsonSchemaLogic.transform('z.string()')).toThrow();
  });

  // ---- output envelope / shape ----

  it('emits a draft-07 object envelope with pretty 2-space indentation', () => {
    const out = zodToJsonSchemaLogic.transform('z.object({ id: z.number() })');
    expect(out).toContain('"$schema": "http://json-schema.org/draft-07/schema#"');
    const schema = JSON.parse(out);
    expect(schema.type).toBe('object');
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    // pretty-printed with 2 spaces
    expect(out).toContain('\n  "type": "object"');
  });

  it('produces an empty-but-valid schema for an empty object body', () => {
    const out = zodToJsonSchemaLogic.transform('z.object({})');
    const schema = JSON.parse(out);
    expect(schema.properties).toEqual({});
    expect(schema.required).toEqual([]);
    expect(schema.type).toBe('object');
  });

  // ---- primitive matching is prefix based (chained refinements ignored) ----

  it('treats chained string refinements as plain strings', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ email: z.string().email().min(3) })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.email).toEqual({ type: 'string' });
    expect(schema.required).toEqual(['email']);
  });

  it('treats chained number refinements as plain numbers', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ age: z.number().int().positive() })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.age).toEqual({ type: 'number' });
  });

  // ---- optional detection ----

  it('detects .optional() with internal whitespace and excludes from required', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ a: z.string(), b: z.number().optional( ) })',
    );
    const schema = JSON.parse(out);
    expect(schema.required).toEqual(['a']);
    expect(Object.keys(schema.properties)).toEqual(['a', 'b']);
  });

  it('marks every field required when none are optional', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ a: z.string(), b: z.number(), c: z.boolean() })',
    );
    const schema = JSON.parse(out);
    expect(schema.required).toEqual(['a', 'b', 'c']);
  });

  // ---- enum parsing ----

  it('parses a single-value enum', () => {
    const out = zodToJsonSchemaLogic.transform("z.object({ k: z.enum(['only']) })");
    const schema = JSON.parse(out);
    expect(schema.properties.k).toEqual({ enum: ['only'] });
  });

  it('parses an enum given without an array literal', () => {
    const out = zodToJsonSchemaLogic.transform('z.object({ k: z.enum("a", "b") })');
    const schema = JSON.parse(out);
    expect(schema.properties.k).toEqual({ enum: ['a', 'b'] });
  });

  it('strips mixed quote styles from enum values', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ k: z.enum([\'a\', "b", `c`]) })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.k).toEqual({ enum: ['a', 'b', 'c'] });
  });

  // ---- quoted property keys ----

  it('strips quotes from quoted property keys', () => {
    const out = zodToJsonSchemaLogic.transform(
      "z.object({ 'first-name': z.string(), \"last name\": z.number() })",
    );
    const schema = JSON.parse(out);
    expect(schema.properties['first-name']).toEqual({ type: 'string' });
    expect(schema.properties['last name']).toEqual({ type: 'number' });
    expect(schema.required).toEqual(['first-name', 'last name']);
  });

  // ---- deep nesting / arrays of objects ----

  it('handles arrays of objects with nested required tracking', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ items: z.array(z.object({ id: z.number(), label: z.string().optional() })) })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.items.type).toBe('array');
    expect(schema.properties.items.items.type).toBe('object');
    expect(schema.properties.items.items.properties.id).toEqual({ type: 'number' });
    expect(schema.properties.items.items.required).toEqual(['id']);
  });

  it('handles nested arrays of primitives', () => {
    const out = zodToJsonSchemaLogic.transform(
      'z.object({ matrix: z.array(z.array(z.number())) })',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.matrix).toEqual({
      type: 'array',
      items: { type: 'array', items: { type: 'number' } },
    });
  });

  // ---- leading content before z.object ----

  it('finds the z.object even when preceded by const declaration', () => {
    const out = zodToJsonSchemaLogic.transform(
      'const User = z.object({ id: z.number() });',
    );
    const schema = JSON.parse(out);
    expect(schema.properties.id).toEqual({ type: 'number' });
  });

  // ---- unicode / emoji ----

  it('preserves unicode and emoji in keys and enum values', () => {
    const out = zodToJsonSchemaLogic.transform(
      "z.object({ ürün: z.string(), mood: z.enum(['😀', '😢']) })",
    );
    const schema = JSON.parse(out);
    expect(schema.properties['ürün']).toEqual({ type: 'string' });
    expect(schema.properties.mood).toEqual({ enum: ['😀', '😢'] });
  });

  // ---- whitespace / empty input error paths ----

  it('throws on empty input', () => {
    expect(() => zodToJsonSchemaLogic.transform('')).toThrow(/z\.object/);
  });

  it('throws on whitespace-only input', () => {
    expect(() => zodToJsonSchemaLogic.transform('   \n\t  ')).toThrow(/z\.object/);
  });

  // ---- unsupported / malformed error paths ----

  it('throws on an unsupported Zod type inside the object', () => {
    expect(() =>
      zodToJsonSchemaLogic.transform('z.object({ when: z.date() })'),
    ).toThrow(/Failed to parse Zod schema/);
  });

  it('throws on a field missing a colon', () => {
    expect(() =>
      zodToJsonSchemaLogic.transform('z.object({ id z.number() })'),
    ).toThrow(/Failed to parse Zod schema/);
  });

  it('throws when a property value is not a z. expression', () => {
    expect(() =>
      zodToJsonSchemaLogic.transform('z.object({ id: number })'),
    ).toThrow(/Failed to parse Zod schema/);
  });

  it('throws on a large valid schema being well-formed (no false errors) and on unbalanced braces', () => {
    // large valid input: should NOT throw and should round-trip to valid JSON
    const fields = Array.from({ length: 50 }, (_, i) => `f${i}: z.string()`).join(', ');
    const out = zodToJsonSchemaLogic.transform(`z.object({ ${fields} })`);
    const schema = JSON.parse(out);
    expect(Object.keys(schema.properties)).toHaveLength(50);
    expect(schema.required).toHaveLength(50);

    // unbalanced delimiters: parseObject never closes -> error
    expect(() =>
      zodToJsonSchemaLogic.transform('z.object({ id: z.number()'),
    ).toThrow(/Failed to parse Zod schema/);
  });

  it('always emits parseable JSON for valid input (idempotent structure)', () => {
    const src = "z.object({ id: z.number(), role: z.enum(['a','b']), tags: z.array(z.string()) })";
    const out1 = zodToJsonSchemaLogic.transform(src);
    const out2 = zodToJsonSchemaLogic.transform(src);
    expect(out1).toBe(out2);
    expect(() => JSON.parse(out1)).not.toThrow();
  });
});

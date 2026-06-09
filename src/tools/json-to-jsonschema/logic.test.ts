import { describe, it, expect } from 'vitest';
import { jsonToJsonSchemaLogic } from './logic';

const transform = (s: string) => jsonToJsonSchemaLogic.transform(s);
const schema = (s: string) => JSON.parse(transform(s));

describe('jsonToJsonSchema', () => {
  it('infers object properties and required list', () => {
    const s = schema('{"a":1,"b":"x","c":true}');
    expect(s.type).toBe('object');
    expect(s.properties.a).toEqual({ type: 'integer' });
    expect(s.properties.b).toEqual({ type: 'string' });
    expect(s.properties.c).toEqual({ type: 'boolean' });
    expect(s.required).toEqual(['a', 'b', 'c']);
  });

  it('distinguishes integer from number', () => {
    expect(schema('{"x":1.5}').properties.x).toEqual({ type: 'number' });
  });

  it('infers array item types from the first element', () => {
    expect(schema('{"tags":["a","b"]}').properties.tags).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
  });

  it('includes the $schema declaration', () => {
    expect(schema('{}').$schema).toContain('json-schema.org');
    expect(schema('{}').$schema).toBe(
      'http://json-schema.org/draft-07/schema#',
    );
  });

  it('throws on invalid JSON', () => {
    expect(() => transform('{bad}')).toThrow();
  });

  // --- top-level primitives -------------------------------------------------

  it('handles a top-level null', () => {
    expect(schema('null')).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'null',
    });
  });

  it('handles a top-level string', () => {
    expect(schema('"hello"').type).toBe('string');
  });

  it('handles a top-level integer', () => {
    expect(schema('42').type).toBe('integer');
  });

  it('handles a top-level float as number', () => {
    expect(schema('3.14').type).toBe('number');
  });

  it('handles a top-level boolean', () => {
    expect(schema('false').type).toBe('boolean');
  });

  // --- empty / object structure ---------------------------------------------

  it('produces an object with empty properties/required for {}', () => {
    const s = schema('{}');
    expect(s.type).toBe('object');
    expect(s.properties).toEqual({});
    expect(s.required).toEqual([]);
  });

  it('infers a nested object recursively', () => {
    const s = schema('{"user":{"id":1,"name":"a"}}');
    expect(s.properties.user).toEqual({
      type: 'object',
      properties: { id: { type: 'integer' }, name: { type: 'string' } },
      required: ['id', 'name'],
    });
  });

  it('lists every key in required, preserving insertion order', () => {
    const s = schema('{"z":1,"a":2,"m":3}');
    expect(s.required).toEqual(['z', 'a', 'm']);
  });

  it('infers null-valued properties as type null', () => {
    expect(schema('{"v":null}').properties.v).toEqual({ type: 'null' });
  });

  // --- arrays ---------------------------------------------------------------

  it('produces type array with no items for an empty array', () => {
    const s = schema('[]');
    expect(s.type).toBe('array');
    expect(s.items).toBeUndefined();
  });

  it('infers nested array items (array of arrays)', () => {
    expect(schema('[[1]]')).toMatchObject({
      type: 'array',
      items: { type: 'array', items: { type: 'integer' } },
    });
  });

  it('infers array of objects from the first element', () => {
    const s = schema('[{"a":1},{"b":2}]');
    expect(s.items).toEqual({
      type: 'object',
      properties: { a: { type: 'integer' } },
      required: ['a'],
    });
  });

  it('uses only the first element type even with mixed arrays', () => {
    // first element is a string, so items is string regardless of later numbers
    expect(schema('["x",1,true]').items).toEqual({ type: 'string' });
  });

  // --- number boundaries ----------------------------------------------------

  it('treats 1.0 (which JSON parses to 1) as integer', () => {
    expect(schema('{"x":1.0}').properties.x).toEqual({ type: 'integer' });
  });

  it('treats exponent integers like 1e3 as integer', () => {
    expect(schema('{"x":1e3}').properties.x).toEqual({ type: 'integer' });
  });

  it('treats zero as integer', () => {
    expect(schema('0').type).toBe('integer');
  });

  it('treats negative integers as integer and negative floats as number', () => {
    expect(schema('{"a":-5,"b":-2.5}').properties.a).toEqual({
      type: 'integer',
    });
    expect(schema('{"a":-5,"b":-2.5}').properties.b).toEqual({
      type: 'number',
    });
  });

  it('treats a very large integer within range as integer', () => {
    expect(schema('9007199254740991').type).toBe('integer');
  });

  // --- unicode / special chars ----------------------------------------------

  it('handles unicode and emoji keys and values', () => {
    const s = schema('{"naïve":"déjà","emoji":"😀"}');
    expect(s.properties['naïve']).toEqual({ type: 'string' });
    expect(s.properties.emoji).toEqual({ type: 'string' });
    expect(s.required).toContain('naïve');
    expect(s.required).toContain('emoji');
  });

  it('handles keys with special characters', () => {
    const s = schema('{"a.b":1,"with space":2,"":3}');
    expect(s.properties['a.b']).toEqual({ type: 'integer' });
    expect(s.properties['with space']).toEqual({ type: 'integer' });
    expect(s.properties['']).toEqual({ type: 'integer' });
  });

  // --- error / edge inputs --------------------------------------------------

  it('throws on empty string input', () => {
    expect(() => transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => transform('   \n\t ')).toThrow();
  });

  it('throws on a bare unquoted identifier', () => {
    expect(() => transform('undefined')).toThrow();
  });

  it('throws on trailing comma', () => {
    expect(() => transform('{"a":1,}')).toThrow();
  });

  it('tolerates leading/trailing whitespace around valid JSON', () => {
    expect(schema('  \n {"a":1} \t ').properties.a).toEqual({
      type: 'integer',
    });
  });

  // --- output format / determinism ------------------------------------------

  it('returns pretty-printed JSON (2-space indent)', () => {
    const out = transform('{"a":1}');
    expect(out).toContain('\n  "type": "object"');
    expect(JSON.parse(out)).toBeTypeOf('object');
  });

  it('is deterministic for the same input', () => {
    const input = '{"a":1,"b":[true],"c":{"d":null}}';
    expect(transform(input)).toBe(transform(input));
  });

  it('handles a deeply / broadly nested large object', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj[`k${i}`] = i;
    const s = schema(JSON.stringify(obj));
    expect(Object.keys(s.properties)).toHaveLength(500);
    expect(s.required).toHaveLength(500);
    expect(s.properties.k0).toEqual({ type: 'integer' });
    expect(s.properties.k499).toEqual({ type: 'integer' });
  });
});

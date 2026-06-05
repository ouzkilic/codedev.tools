import { describe, it, expect } from 'vitest';
import { jsonToJsonSchemaLogic } from './logic';

const schema = (s: string) => JSON.parse(jsonToJsonSchemaLogic.transform(s));

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
  it('infers array item types', () => {
    expect(schema('{"tags":["a","b"]}').properties.tags).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
  });
  it('includes the $schema declaration', () => {
    expect(schema('{}').$schema).toContain('json-schema.org');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToJsonSchemaLogic.transform('{bad}')).toThrow();
  });
});

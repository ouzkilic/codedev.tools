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
});

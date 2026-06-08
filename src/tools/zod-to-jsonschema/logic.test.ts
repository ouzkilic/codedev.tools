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
});

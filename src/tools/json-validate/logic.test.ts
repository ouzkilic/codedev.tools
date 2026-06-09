import { describe, it, expect } from 'vitest';
import { jsonValidateLogic } from './logic';

const run = (data: string, schema = '') =>
  jsonValidateLogic.transform(data, { options: {}, secondary: schema });

const schema = '{"type":"object","required":["id"],"properties":{"id":{"type":"number"}}}';

describe('jsonValidate — metadata', () => {
  it('exposes a secondary input definition with label and placeholder', () => {
    expect(jsonValidateLogic.secondary).toBeDefined();
    expect(jsonValidateLogic.secondary?.label).toMatch(/schema/i);
    expect(typeof jsonValidateLogic.secondary?.placeholder).toBe('string');
  });

  it('does not declare any options', () => {
    expect(jsonValidateLogic.options).toBeUndefined();
  });
});

describe('jsonValidate — no schema branch', () => {
  it('reports valid JSON when no schema is provided', () => {
    expect(run('{"a":1}')).toMatch(/valid json/i);
  });

  it('returns the exact no-schema success message', () => {
    expect(run('{"a":1}')).toBe('✓ Valid JSON (no schema provided).');
  });

  it('treats a whitespace-only schema as no schema', () => {
    expect(run('{"a":1}', '   \n\t ')).toBe('✓ Valid JSON (no schema provided).');
  });

  it('accepts a top-level JSON array with no schema', () => {
    expect(run('[1,2,3]')).toMatch(/valid json/i);
  });

  it('accepts a bare JSON string literal with no schema', () => {
    expect(run('"hello"')).toMatch(/valid json/i);
  });

  it('accepts a bare number, including zero and negatives', () => {
    expect(run('0')).toMatch(/valid json/i);
    expect(run('-42')).toMatch(/valid json/i);
    expect(run('3.14159')).toMatch(/valid json/i);
  });

  it('accepts JSON null, true and false with no schema', () => {
    expect(run('null')).toMatch(/valid json/i);
    expect(run('true')).toMatch(/valid json/i);
    expect(run('false')).toMatch(/valid json/i);
  });

  it('accepts unicode / emoji content', () => {
    expect(run('{"msg":"héllo 🌍 世界"}')).toMatch(/valid json/i);
  });

  it('accepts boundary-large integers', () => {
    expect(run('9007199254740991')).toMatch(/valid json/i);
  });

  it('accepts a deeply nested / large object', () => {
    const big = JSON.stringify({ items: Array.from({ length: 500 }, (_, i) => ({ i })) });
    expect(run(big)).toMatch(/valid json/i);
  });
});

describe('jsonValidate — schema valid branch', () => {
  it('confirms data matching the schema', () => {
    expect(run('{"id":1}', schema)).toMatch(/✓/);
  });

  it('returns the exact schema-match success message', () => {
    expect(run('{"id":1}', schema)).toBe('✓ Valid — data matches the schema.');
  });

  it('allows extra properties not listed in the schema', () => {
    expect(run('{"id":7,"extra":"ok"}', schema)).toMatch(/✓/);
  });

  it('validates a typed array schema against matching data', () => {
    const arrSchema = '{"type":"array","items":{"type":"number"}}';
    expect(run('[1,2,3]', arrSchema)).toBe('✓ Valid — data matches the schema.');
  });

  it('validates an empty-object schema against any object', () => {
    expect(run('{"anything":true}', '{"type":"object"}')).toMatch(/✓/);
  });
});

describe('jsonValidate — schema invalid branch', () => {
  it('lists schema violations and mentions the failing keyword', () => {
    const out = run('{"name":"x"}', schema);
    expect(out).toMatch(/✗/);
    expect(out).toMatch(/required/i);
  });

  it('reports a type mismatch', () => {
    expect(run('{"id":"not-a-number"}', schema)).toMatch(/✗/);
  });

  it('starts the failure message with the invalid header', () => {
    expect(run('{"name":"x"}', schema).startsWith('✗ Invalid:\n')).toBe(true);
  });

  it('formats each error line with a bullet prefix', () => {
    const out = run('{"id":"nope"}', schema);
    expect(out).toMatch(/^•/m);
  });

  it('labels root-level errors with (root)', () => {
    // type mismatch at the document root: schema wants object, data is array
    const out = run('[1,2,3]', '{"type":"object"}');
    expect(out).toMatch(/✗/);
    expect(out).toContain('(root)');
  });

  it('uses an instancePath for nested property errors', () => {
    const out = run('{"id":"nope"}', schema);
    expect(out).toMatch(/✗/);
    // ajv instancePath for the id property is /id
    expect(out).toContain('/id');
  });

  it('collects multiple errors at once (allErrors: true)', () => {
    const multi =
      '{"type":"object","required":["id","name"],"properties":{"id":{"type":"number"},"name":{"type":"string"}}}';
    const out = run('{"id":"x"}', multi);
    expect(out).toMatch(/✗/);
    // missing "name" (required) AND id type mismatch -> at least two bullet lines
    const bulletLines = out.split('\n').filter((l) => l.startsWith('•'));
    expect(bulletLines.length).toBeGreaterThanOrEqual(2);
  });

  it('reports an enum violation', () => {
    const enumSchema = '{"enum":["a","b"]}';
    expect(run('"c"', enumSchema)).toMatch(/✗/);
    expect(run('"a"', enumSchema)).toMatch(/✓/);
  });

  it('reports a minimum/number-bound violation', () => {
    const boundSchema = '{"type":"number","minimum":10}';
    expect(run('5', boundSchema)).toMatch(/✗/);
    expect(run('10', boundSchema)).toMatch(/✓/);
  });
});

describe('jsonValidate — error / throwing paths', () => {
  it('throws on invalid JSON data', () => {
    expect(() => run('{bad}', schema)).toThrow();
  });

  it('throws on invalid JSON data even without a schema', () => {
    expect(() => run('{bad}')).toThrow();
  });

  it('throws on an empty data string', () => {
    expect(() => run('')).toThrow();
  });

  it('throws on a whitespace-only data string', () => {
    expect(() => run('   \n  ')).toThrow();
  });

  it('throws on trailing-garbage / unterminated input', () => {
    expect(() => run('{"a":1}extra', '')).toThrow();
  });

  it('throws when the schema text itself is malformed JSON', () => {
    expect(() => run('{"id":1}', '{not valid')).toThrow();
  });
});

describe('jsonValidate — determinism', () => {
  it('produces identical output across repeated calls', () => {
    const a = run('{"id":"nope"}', schema);
    const b = run('{"id":"nope"}', schema);
    expect(a).toBe(b);
  });

  it('is order-stable for multi-error output across calls', () => {
    const multi =
      '{"type":"object","required":["id","name"],"properties":{"id":{"type":"number"}}}';
    expect(run('{}', multi)).toBe(run('{}', multi));
  });
});

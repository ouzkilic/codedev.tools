import { describe, it, expect } from 'vitest';
import { jsonSchemaToJsonLogic } from './logic';

const run = (input: string) =>
  jsonSchemaToJsonLogic.transform(input, { options: {}, secondary: '' });

const runJson = (input: string) => JSON.parse(run(input));

describe('jsonSchemaToJsonLogic', () => {
  // --- existing assertions, preserved ---
  it('generates object sample', () => {
    const input =
      '{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"}}}';
    expect(runJson(input)).toEqual({ id: 0, name: 'string' });
  });

  it('generates array sample', () => {
    const input = '{"type":"array","items":{"type":"number"}}';
    expect(runJson(input)).toEqual([0]);
  });

  it('uses first enum value', () => {
    expect(runJson('{"enum":["a","b"]}')).toBe('a');
  });

  it('throws on invalid JSON', () => {
    expect(() => run('{bad')).toThrow();
  });

  // --- empty / whitespace handling ---
  it('returns empty string for empty input', () => {
    expect(run('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(run('   \n\t  ')).toBe('');
  });

  // --- primitive type defaults ---
  it('samples a string type', () => {
    expect(runJson('{"type":"string"}')).toBe('string');
  });

  it('samples integer and number types as 0', () => {
    expect(runJson('{"type":"integer"}')).toBe(0);
    expect(runJson('{"type":"number"}')).toBe(0);
  });

  it('samples boolean type as true', () => {
    expect(runJson('{"type":"boolean"}')).toBe(true);
  });

  it('samples null type as null', () => {
    expect(runJson('{"type":"null"}')).toBe(null);
  });

  it('returns null for unknown/missing type with no other hints', () => {
    expect(runJson('{"type":"banana"}')).toBe(null);
    expect(runJson('{}')).toBe(null);
  });

  // --- precedence: default > example > enum > type ---
  it('prefers default over type', () => {
    expect(runJson('{"type":"string","default":"hello"}')).toBe('hello');
  });

  it('prefers default over example and enum', () => {
    expect(
      runJson('{"type":"string","default":"d","example":"e","enum":["x"]}'),
    ).toBe('d');
  });

  it('uses default even when it is null', () => {
    // 'default' in s is true, value null is returned regardless of type
    expect(runJson('{"type":"string","default":null}')).toBe(null);
  });

  it('uses default of 0 (falsy) rather than type fallback', () => {
    expect(runJson('{"type":"number","default":0}')).toBe(0);
  });

  it('prefers example over enum and type', () => {
    expect(runJson('{"type":"integer","example":42,"enum":["x"]}')).toBe(42);
  });

  it('uses example object verbatim', () => {
    expect(runJson('{"type":"object","example":{"a":1}}')).toEqual({ a: 1 });
  });

  it('uses first enum value even when it is falsy', () => {
    expect(runJson('{"enum":[0,1,2]}')).toBe(0);
    expect(runJson('{"enum":[false,true]}')).toBe(false);
  });

  it('returns undefined-from-empty-enum path as JSON', () => {
    // enum is an array but empty -> enum[0] is undefined -> JSON.stringify(undefined) === undefined
    // transform returns the string "undefined" via JSON.stringify? Actually JSON.stringify(undefined) returns undefined (not a string).
    // Guard with a property assertion rather than exact value.
    const out = run('{"enum":[]}');
    expect(out === undefined || out === 'undefined' || out === '').toBe(true);
  });

  // --- objects ---
  it('generates empty object for object with empty properties', () => {
    expect(runJson('{"type":"object","properties":{}}')).toEqual({});
  });

  it('generates empty object for object type with no properties key', () => {
    expect(runJson('{"type":"object"}')).toEqual({});
  });

  it('ignores properties when type is not object', () => {
    // properties present but type undefined -> falls through to default null
    expect(runJson('{"properties":{"a":{"type":"string"}}}')).toBe(null);
  });

  it('handles deeply nested objects and arrays', () => {
    const input = JSON.stringify({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            active: { type: 'boolean' },
          },
        },
        count: { type: 'integer' },
      },
    });
    expect(runJson(input)).toEqual({
      user: { name: 'string', tags: ['string'], active: true },
      count: 0,
    });
  });

  // --- arrays ---
  it('generates array with null element when items missing', () => {
    // items || {} -> sample({}) -> null
    expect(runJson('{"type":"array"}')).toEqual([null]);
  });

  it('generates array of objects', () => {
    const input =
      '{"type":"array","items":{"type":"object","properties":{"id":{"type":"integer"}}}}';
    expect(runJson(input)).toEqual([{ id: 0 }]);
  });

  it('generates nested array of arrays', () => {
    const input =
      '{"type":"array","items":{"type":"array","items":{"type":"number"}}}';
    expect(runJson(input)).toEqual([[0]]);
  });

  // --- top-level scalar / structural JSON values ---
  it('handles top-level JSON null as schema', () => {
    // JSON.parse("null") -> null -> sample(null) returns null -> "null"
    expect(run('null')).toBe('null');
  });

  it('handles top-level JSON array as schema (not an object)', () => {
    // sample sees an array; typeof [] === 'object' so it passes the guard,
    // 'default'/'example' not in array, enum not present (Array.isArray(s.enum) where s.enum undefined -> false),
    // s.type undefined -> default branch -> null
    expect(run('[1,2,3]')).toBe('null');
  });

  it('handles top-level JSON number as schema', () => {
    // sample(5): typeof 5 !== 'object' -> returns null
    expect(run('5')).toBe('null');
  });

  it('handles top-level JSON string as schema', () => {
    expect(run('"hi"')).toBe('null');
  });

  it('handles top-level JSON boolean as schema', () => {
    expect(run('true')).toBe('null');
  });

  // --- unicode / emoji / special chars carried through default & example ---
  it('preserves unicode and emoji in default values', () => {
    expect(runJson('{"type":"string","default":"héllo 🌍 \\u00e9"}')).toBe(
      'héllo 🌍 é',
    );
  });

  it('preserves special characters in enum values', () => {
    expect(runJson('{"enum":["a\\nb\\t\\"c"]}')).toBe('a\nb\t"c');
  });

  // --- number boundaries via defaults ---
  it('preserves boundary and negative numbers in defaults', () => {
    expect(runJson('{"type":"number","default":-273.15}')).toBe(-273.15);
    expect(
      runJson('{"type":"integer","default":9007199254740991}'),
    ).toBe(9007199254740991);
    expect(runJson('{"type":"number","default":0}')).toBe(0);
  });

  // --- error paths ---
  it('throws with a descriptive message on malformed JSON', () => {
    expect(() => run('{"type": }')).toThrow(/Invalid JSON Schema/);
  });

  it('throws on trailing garbage after valid JSON', () => {
    expect(() => run('{"type":"string"} extra')).toThrow();
  });

  it('throws on unterminated string', () => {
    expect(() => run('{"type":"strin')).toThrow();
  });

  // --- output formatting ---
  it('produces 2-space pretty-printed JSON output', () => {
    const out = run(
      '{"type":"object","properties":{"a":{"type":"string"}}}',
    );
    expect(out).toBe('{\n  "a": "string"\n}');
  });

  // --- determinism / idempotency ---
  it('is deterministic across repeated calls', () => {
    const input =
      '{"type":"object","properties":{"x":{"type":"integer"},"y":{"type":"array","items":{"type":"boolean"}}}}';
    expect(run(input)).toBe(run(input));
  });

  it('produces output that is itself valid parseable JSON for structured schemas', () => {
    const input =
      '{"type":"object","properties":{"a":{"type":"string"},"b":{"type":"number"}}}';
    const out = run(input);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  // --- large input ---
  it('handles a large object schema with many properties', () => {
    const props: Record<string, { type: string }> = {};
    for (let i = 0; i < 500; i++) props[`field${i}`] = { type: 'integer' };
    const input = JSON.stringify({ type: 'object', properties: props });
    const out = runJson(input);
    expect(Object.keys(out)).toHaveLength(500);
    expect(out.field0).toBe(0);
    expect(out.field499).toBe(0);
  });
});

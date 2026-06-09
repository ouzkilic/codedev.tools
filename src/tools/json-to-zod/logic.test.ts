import { describe, it, expect } from 'vitest';
import { jsonToZodLogic } from './logic';

describe('jsonToZod', () => {
  // --- happy path: the original assertions, preserved ---
  it('generates a Zod schema from JSON', () => {
    const out = jsonToZodLogic.transform('{"a":1,"b":"x"}');
    expect(out).toContain('import { z } from "zod";');
    expect(out).toContain('const schema = z.object({');
    expect(out).toContain('a: z.number()');
    expect(out).toContain('b: z.string()');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToZodLogic.transform('{bad}')).toThrow();
  });

  // --- output framing: import header + trailing newline ---
  it('prepends the zod import and ends with a newline', () => {
    const out = jsonToZodLogic.transform('1');
    expect(out.startsWith('import { z } from "zod";\n\n')).toBe(true);
    expect(out.endsWith('\n')).toBe(true);
  });

  it('produces an exact, prettier-formatted output for a flat object', () => {
    const out = jsonToZodLogic.transform('{"a":1,"b":"x"}');
    expect(out).toBe(
      'import { z } from "zod";\n\nconst schema = z.object({ a: z.number(), b: z.string() });\n\n',
    );
  });

  // --- primitive type mapping (every typeof branch reachable from JSON.parse) ---
  it('maps a top-level string to z.string()', () => {
    const out = jsonToZodLogic.transform('"hi"');
    expect(out).toContain('const schema = z.string();');
  });

  it('maps a top-level number to z.number()', () => {
    const out = jsonToZodLogic.transform('5');
    expect(out).toContain('const schema = z.number();');
  });

  it('maps a top-level boolean to z.boolean()', () => {
    const out = jsonToZodLogic.transform('true');
    expect(out).toContain('const schema = z.boolean();');
  });

  it('maps a top-level null to z.null()', () => {
    const out = jsonToZodLogic.transform('null');
    expect(out).toContain('const schema = z.null();');
  });

  it('maps null-valued object fields to z.null()', () => {
    const out = jsonToZodLogic.transform('{"x":null}');
    expect(out).toContain('x: z.null()');
  });

  // --- number boundaries: zero, negative, fractional, huge ---
  it('maps zero, negative, and fractional numbers all to z.number()', () => {
    const out = jsonToZodLogic.transform('{"zero":0,"neg":-5,"frac":1.5}');
    expect(out).toContain('zero: z.number()');
    expect(out).toContain('neg: z.number()');
    expect(out).toContain('frac: z.number()');
    expect(out).not.toContain('z.string()');
  });

  it('maps very large numbers to z.number() (JSON.parse yields a number, not bigint)', () => {
    const out = jsonToZodLogic.transform('{"big":9007199254740993}');
    expect(out).toContain('big: z.number()');
    expect(out).not.toContain('z.number().int()');
  });

  // --- arrays ---
  it('maps a homogeneous number array to z.array(z.number())', () => {
    const out = jsonToZodLogic.transform('[1,2,3]');
    expect(out).toContain('const schema = z.array(z.number());');
  });

  it('maps a string array to z.array(z.string())', () => {
    const out = jsonToZodLogic.transform('["a","b"]');
    expect(out).toContain('const schema = z.array(z.string());');
  });

  it('deduplicates and unions mixed-type arrays', () => {
    const out = jsonToZodLogic.transform('[1,"a",true]');
    expect(out).toContain('z.array(z.union([z.number(), z.string(), z.boolean()]))');
  });

  it('collapses repeated types in a mixed array to a deduped union', () => {
    const out = jsonToZodLogic.transform('[1,2,"3"]');
    expect(out).toContain('z.array(z.union([z.number(), z.string()]))');
  });

  it('maps an empty array to z.array(z.unknown())', () => {
    const out = jsonToZodLogic.transform('[]');
    expect(out).toContain('const schema = z.array(z.unknown());');
  });

  it('maps an array of objects to an array of an object schema', () => {
    const out = jsonToZodLogic.transform('[{"a":1},{"a":2}]');
    expect(out).toContain('z.array(z.object({ a: z.number() }))');
  });

  // --- nesting / determinism ---
  it('recurses into nested objects', () => {
    const out = jsonToZodLogic.transform('{"a":{"b":{"c":[1]}}}');
    expect(out).toContain('a: z.object({ b: z.object({ c: z.array(z.number()) }) })');
  });

  it('handles a deeply nested mixed structure', () => {
    const out = jsonToZodLogic.transform('{"user":{"name":"a","age":3,"active":true}}');
    expect(out).toContain(
      'user: z.object({ name: z.string(), age: z.number(), active: z.boolean() })',
    );
  });

  it('is deterministic: identical input yields identical output', () => {
    const input = '{"a":1,"b":[true,false],"c":{"d":"x"}}';
    expect(jsonToZodLogic.transform(input)).toBe(jsonToZodLogic.transform(input));
  });

  // --- key handling / quoting ---
  it('quotes keys that are not valid identifiers and leaves plain keys unquoted', () => {
    const out = jsonToZodLogic.transform('{"with space":1,"with-dash":2}');
    expect(out).toContain('"with space": z.number()');
    expect(out).toContain('"with-dash": z.number()');
  });

  it('handles unicode and emoji keys/values', () => {
    const out = jsonToZodLogic.transform('{"emoji\u{1F600}":"値"}');
    expect(out).toContain('"emoji\u{1F600}": z.string()');
  });

  // --- whitespace tolerance (JSON.parse trims) ---
  it('tolerates surrounding whitespace in the input', () => {
    const out = jsonToZodLogic.transform('   {"a":1}   ');
    expect(out).toContain('a: z.number()');
  });

  it('handles a large object without crashing and types every field', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 200; i++) obj[`field${i}`] = i;
    const out = jsonToZodLogic.transform(JSON.stringify(obj));
    expect(out).toContain('field0: z.number()');
    expect(out).toContain('field199: z.number()');
    // 200 number fields => 200 occurrences of z.number()
    expect(out.match(/z\.number\(\)/g)?.length).toBe(200);
  });

  // --- error paths ---
  it('throws on an empty string', () => {
    expect(() => jsonToZodLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => jsonToZodLogic.transform('    ')).toThrow();
  });

  it('throws on a trailing comma (invalid JSON)', () => {
    expect(() => jsonToZodLogic.transform('{"a":1,}')).toThrow();
  });

  it('throws on single-quoted (non-JSON) input', () => {
    expect(() => jsonToZodLogic.transform("{'a':1}")).toThrow();
  });
});

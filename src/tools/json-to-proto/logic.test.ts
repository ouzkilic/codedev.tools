import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { jsonToProtoLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const run = (input: string): string => jsonToProtoLogic.transform(input, ctx);

describe('jsonToProtoLogic', () => {
  it('infers scalar fields with proto3 syntax', () => {
    const out = run('{"id":1,"name":"x","active":true}');
    expect(out.startsWith('syntax = "proto3";\n\n')).toBe(true);
    expect(out).toContain('message Root {');
    expect(out).toContain('int64 id = 1;');
    expect(out).toContain('string name = 2;');
    expect(out).toContain('bool active = 3;');
  });

  it('infers repeated string for arrays', () => {
    const out = run('{"tags":["a"]}');
    expect(out).toContain('repeated string tags = 1;');
  });

  it('uses double for non-integer numbers', () => {
    const out = run('{"ratio":1.5}');
    expect(out).toContain('double ratio = 1;');
  });

  it('creates nested messages for objects', () => {
    const out = run('{"user":{"age":3}}');
    expect(out).toContain('message User {');
    expect(out).toContain('int64 age = 1;');
    expect(out).toContain('User user = 1;');
  });

  it('throws on invalid JSON', () => {
    expect(() => run('not json')).toThrow();
  });

  // --- Top-level validation / error paths ---

  it('throws on empty string input', () => {
    expect(() => run('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => run('   \n\t  ')).toThrow();
  });

  it('throws with "Invalid JSON input" message on malformed JSON', () => {
    expect(() => run('{bad json}')).toThrow('Invalid JSON input');
  });

  it('throws "Input must be a JSON object" for a top-level array', () => {
    expect(() => run('[1,2,3]')).toThrow('Input must be a JSON object');
  });

  it('throws "Input must be a JSON object" for a top-level scalar number', () => {
    expect(() => run('42')).toThrow('Input must be a JSON object');
  });

  it('throws "Input must be a JSON object" for a top-level string', () => {
    expect(() => run('"hello"')).toThrow('Input must be a JSON object');
  });

  it('throws "Input must be a JSON object" for top-level null', () => {
    expect(() => run('null')).toThrow('Input must be a JSON object');
  });

  it('throws "Input must be a JSON object" for top-level boolean', () => {
    expect(() => run('true')).toThrow('Input must be a JSON object');
  });

  // --- Scalar type inference branches ---

  it('maps null fields to string', () => {
    const out = run('{"nick":null}');
    expect(out).toContain('string nick = 1;');
  });

  it('treats zero as an integer (int64)', () => {
    const out = run('{"count":0}');
    expect(out).toContain('int64 count = 1;');
  });

  it('treats negative integers as int64', () => {
    const out = run('{"delta":-7}');
    expect(out).toContain('int64 delta = 1;');
  });

  it('treats negative non-integers as double', () => {
    const out = run('{"temp":-2.5}');
    expect(out).toContain('double temp = 1;');
  });

  it('treats large integers as int64', () => {
    const out = run('{"big":9007199254740991}');
    expect(out).toContain('int64 big = 1;');
  });

  it('treats false booleans as bool', () => {
    const out = run('{"flag":false}');
    expect(out).toContain('bool flag = 1;');
  });

  it('treats empty string value as string', () => {
    const out = run('{"label":""}');
    expect(out).toContain('string label = 1;');
  });

  it('handles unicode and emoji string values', () => {
    const out = run('{"greeting":"héllo 🌍"}');
    expect(out).toContain('string greeting = 1;');
  });

  // --- Field numbering ---

  it('assigns sequential 1-based field numbers in object order', () => {
    const out = run('{"a":1,"b":2,"c":3,"d":4}');
    expect(out).toContain('int64 a = 1;');
    expect(out).toContain('int64 b = 2;');
    expect(out).toContain('int64 c = 3;');
    expect(out).toContain('int64 d = 4;');
  });

  // --- pascalCase message naming ---

  it('pascal-cases snake_case keys into nested message names but keeps the field name', () => {
    const out = run('{"home_address":{"zip":"x"}}');
    expect(out).toContain('message HomeAddress {');
    expect(out).toContain('HomeAddress home_address = 1;');
  });

  it('pascal-cases kebab and dotted keys for message names', () => {
    const out = run('{"user.profile-data":{"x":1}}');
    expect(out).toContain('message UserProfileData {');
  });

  it('preserves camelCase tail characters when pascal-casing (only first letter upcased)', () => {
    const out = run('{"userName":{"x":1}}');
    expect(out).toContain('message UserName {');
    expect(out).toContain('UserName userName = 1;');
  });

  it('falls back to "Field" message name when key has no alphanumerics', () => {
    const out = run('{"___":{"x":1}}');
    expect(out).toContain('message Field {');
    expect(out).toContain('Field ___ = 1;');
  });

  // --- Arrays ---

  it('infers repeated int64 for integer arrays from first element', () => {
    const out = run('{"nums":[1,2,3]}');
    expect(out).toContain('repeated int64 nums = 1;');
  });

  it('infers repeated double for float arrays', () => {
    const out = run('{"vals":[1.1]}');
    expect(out).toContain('repeated double vals = 1;');
  });

  it('infers repeated bool for boolean arrays', () => {
    const out = run('{"flags":[true,false]}');
    expect(out).toContain('repeated bool flags = 1;');
  });

  it('falls back to repeated string for empty arrays', () => {
    const out = run('{"empty":[]}');
    expect(out).toContain('repeated string empty = 1;');
  });

  it('uses only the first element type to infer a mixed array', () => {
    // first element is a string, so repeated string regardless of later numbers
    const out = run('{"mixed":["a",1,true]}');
    expect(out).toContain('repeated string mixed = 1;');
  });

  it('creates a nested message for arrays of objects', () => {
    const out = run('{"items":[{"sku":"s","qty":2}]}');
    expect(out).toContain('message Items {');
    expect(out).toContain('string sku = 1;');
    expect(out).toContain('int64 qty = 2;');
    expect(out).toContain('repeated Items items = 1;');
  });

  it('handles arrays of arrays as nested repeated', () => {
    const out = run('{"grid":[[1,2],[3,4]]}');
    expect(out).toContain('repeated repeated int64 grid = 1;');
  });

  // --- Nested message ordering / structure ---

  it('emits child messages before the Root message', () => {
    const out = run('{"user":{"age":3}}');
    expect(out.indexOf('message User {')).toBeLessThan(out.indexOf('message Root {'));
  });

  it('separates messages with a blank line and ends with a newline', () => {
    const out = run('{"user":{"age":3}}');
    expect(out).toContain('}\n\nmessage Root {');
    expect(out.endsWith('}\n')).toBe(true);
  });

  it('builds deeply nested messages', () => {
    const out = run('{"a":{"b":{"c":1}}}');
    expect(out).toContain('message A {');
    expect(out).toContain('message B {');
    expect(out).toContain('int64 c = 1;');
    expect(out).toContain('B b = 1;');
    expect(out).toContain('A a = 1;');
    // deepest child first, root last
    expect(out.indexOf('message B {')).toBeLessThan(out.indexOf('message A {'));
    expect(out.indexOf('message A {')).toBeLessThan(out.indexOf('message Root {'));
  });

  // --- Empty object / structural edge cases ---

  it('renders an empty Root message for {}', () => {
    const out = run('{}');
    expect(out).toContain('message Root {\n\n}');
  });

  it('produces a single Root message for a flat object', () => {
    const out = run('{"x":1}');
    const matches = out.match(/message /g) ?? [];
    expect(matches.length).toBe(1);
  });

  // --- Determinism / large input ---

  it('is deterministic for identical input', () => {
    const input = '{"id":1,"name":"x","nested":{"v":true}}';
    expect(run(input)).toBe(run(input));
  });

  it('handles a large flat object with many fields', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 200; i++) obj[`field${i}`] = i;
    const out = run(JSON.stringify(obj));
    expect(out).toContain('int64 field0 = 1;');
    expect(out).toContain('int64 field199 = 200;');
  });
});

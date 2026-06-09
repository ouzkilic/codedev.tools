import { describe, it, expect } from 'vitest';
import { jsonToGraphqlLogic } from './logic';

const run = (input: string) =>
  jsonToGraphqlLogic.transform(input, { options: {}, secondary: '' });

describe('jsonToGraphqlLogic', () => {
  it('maps scalar fields', () => {
    const out = run('{"id":1,"name":"x","price":2.5}');
    expect(out).toContain('type Root {');
    expect(out).toContain('id: Int');
    expect(out).toContain('name: String');
    expect(out).toContain('price: Float');
  });

  it('creates nested named types', () => {
    const out = run('{"user":{"id":1}}');
    expect(out).toContain('user: User');
    expect(out).toContain('type User {');
  });

  it('maps booleans and arrays', () => {
    const out = run('{"active":true,"tags":["a"],"empty":[]}');
    expect(out).toContain('active: Boolean');
    expect(out).toContain('tags: [String]');
    expect(out).toContain('empty: [String]');
  });

  it('places Root before nested types', () => {
    const out = run('{"user":{"id":1}}');
    expect(out.indexOf('type Root {')).toBeLessThan(out.indexOf('type User {'));
  });

  it('maps null to String', () => {
    const out = run('{"middle":null}');
    expect(out).toContain('middle: String');
  });

  it('distinguishes Int from Float (including negative and zero)', () => {
    const out = run('{"a":0,"b":-3,"c":-2.5,"d":1000000}');
    expect(out).toContain('a: Int');
    expect(out).toContain('b: Int');
    expect(out).toContain('c: Float');
    expect(out).toContain('d: Int');
  });

  it('treats whole-number floats as Int (Number.isInteger semantics)', () => {
    // 2.0 parses to the integer 2, so Number.isInteger is true.
    const out = run('{"x":2.0}');
    expect(out).toContain('x: Int');
  });

  it('infers array element type from the first element', () => {
    const out = run('{"nums":[1,2,3]}');
    expect(out).toContain('nums: [Int]');
  });

  it('infers float array element type', () => {
    const out = run('{"rates":[1.5,2.5]}');
    expect(out).toContain('rates: [Float]');
  });

  it('builds a named type for arrays of objects using singularized key', () => {
    const out = run('{"items":[{"id":1}]}');
    // singular('items') -> 'item', pascal('item') -> 'Item'
    expect(out).toContain('items: [Item]');
    expect(out).toContain('type Item {');
    expect(out).toContain('id: Int');
  });

  it('singularizes the array key only by stripping one trailing s', () => {
    const out = run('{"users":[{"id":1}]}');
    expect(out).toContain('users: [User]');
    expect(out).toContain('type User {');
  });

  it('handles deeply nested objects', () => {
    const out = run('{"a":{"b":{"c":{"id":1}}}}');
    expect(out).toContain('a: A');
    expect(out).toContain('b: B');
    expect(out).toContain('c: C');
    expect(out).toContain('type A {');
    expect(out).toContain('type B {');
    expect(out).toContain('type C {');
    expect(out).toContain('id: Int');
  });

  it('orders parent types before nested child types', () => {
    const out = run('{"a":{"b":{"id":1}}}');
    expect(out.indexOf('type Root {')).toBeLessThan(out.indexOf('type A {'));
    expect(out.indexOf('type A {')).toBeLessThan(out.indexOf('type B {'));
  });

  it('deduplicates colliding type names with numeric suffix', () => {
    // Two distinct object-valued keys both pascalize to the same base name.
    const out = run('{"foo":{"x":1},"Foo":{"y":2}}');
    // pascal('foo') -> 'Foo' (used), pascal('Foo') -> 'Foo' -> 'Foo2'
    expect(out).toContain('foo: Foo');
    expect(out).toContain('Foo: Foo2');
    expect(out).toContain('type Foo {');
    expect(out).toContain('type Foo2 {');
    expect(out).toContain('x: Int');
    expect(out).toContain('y: Int');
  });

  it('pascalizes keys with separators/special chars', () => {
    const out = run('{"user_profile":{"id":1}}');
    // pascal('user_profile') -> 'UserProfile'
    expect(out).toContain('user_profile: UserProfile');
    expect(out).toContain('type UserProfile {');
  });

  it('joins multiple type definitions with a blank line', () => {
    const out = run('{"user":{"id":1}}');
    expect(out).toContain('}\n\ntype User {');
  });

  it('returns empty string for a top-level scalar (no object type produced)', () => {
    expect(run('42')).toBe('');
    expect(run('"hello"')).toBe('');
    expect(run('true')).toBe('');
    expect(run('null')).toBe('');
  });

  it('returns empty string for a top-level array of scalars', () => {
    // Top-level value is an array -> gqlType returns a type string but registers
    // no named type, so the types map stays empty.
    expect(run('[1,2,3]')).toBe('');
  });

  it('produces a type for a top-level array of objects (element registered, root not)', () => {
    // singular('Root') -> 'Roo' (strips trailing... actually no trailing s) -> 'Root'
    const out = run('[{"id":1}]');
    expect(out).toContain('type Root {');
    expect(out).toContain('id: Int');
  });

  it('handles empty object as an empty type body', () => {
    const out = run('{}');
    // Object.entries -> [], map().join('') -> '', so "type Root {\n\n}"
    expect(out).toBe('type Root {\n\n}');
  });

  it('handles unicode and emoji string values as String', () => {
    const out = run('{"name":"héllo 🚀","city":"İstanbul"}');
    expect(out).toContain('name: String');
    expect(out).toContain('city: String');
  });

  it('preserves field key names verbatim (including unusual characters)', () => {
    const out = run('{"weird-key":1}');
    expect(out).toContain('weird-key: Int');
  });

  it('throws on malformed JSON', () => {
    expect(() => run('{not valid json}')).toThrow();
    expect(() => run('{"a":}')).toThrow();
    expect(() => run("{'a':1}")).toThrow();
  });

  it('throws on empty and whitespace-only input', () => {
    expect(() => run('')).toThrow();
    expect(() => run('   ')).toThrow();
  });

  it('is deterministic for identical input', () => {
    const json = '{"user":{"id":1,"tags":["a"]},"count":3}';
    expect(run(json)).toBe(run(json));
  });

  it('handles a moderately large object without crashing', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj[`field${i}`] = i;
    const out = run(JSON.stringify(obj));
    expect(out).toContain('field0: Int');
    expect(out).toContain('field499: Int');
    expect(out.startsWith('type Root {')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { jsonFlattenLogic } from './logic';

const flat = (s: string) => JSON.parse(jsonFlattenLogic.transform(s));

describe('jsonFlatten', () => {
  it('flattens nested objects with dot notation', () => {
    expect(flat('{"a":{"b":{"c":1}}}')).toEqual({ 'a.b.c': 1 });
  });

  it('flattens arrays with bracket notation', () => {
    expect(flat('{"a":[1,2]}')).toEqual({ 'a[0]': 1, 'a[1]': 2 });
  });

  it('handles objects nested inside arrays', () => {
    expect(flat('{"a":[{"b":1},{"c":2}]}')).toEqual({ 'a[0].b': 1, 'a[1].c': 2 });
  });

  it('handles arrays nested inside objects inside arrays', () => {
    expect(flat('{"a":[{"b":[10,20]}]}')).toEqual({ 'a[0].b[0]': 10, 'a[0].b[1]': 20 });
  });

  it('preserves empty objects and arrays as leaves', () => {
    expect(flat('{"a":{},"b":[]}')).toEqual({ a: {}, b: [] });
  });

  it('preserves nested empty containers as leaves', () => {
    expect(flat('{"a":{"b":{},"c":[]}}')).toEqual({ 'a.b': {}, 'a.c': [] });
  });

  it('flattens a mix of all primitive leaf types', () => {
    expect(flat('{"s":"x","n":3.5,"b":true,"z":null}')).toEqual({
      s: 'x',
      n: 3.5,
      b: true,
      z: null,
    });
  });

  it('preserves null leaves nested deeply', () => {
    expect(flat('{"a":{"b":null}}')).toEqual({ 'a.b': null });
  });

  it('surfaces a top-level primitive number under "value"', () => {
    expect(flat('5')).toEqual({ value: 5 });
  });

  it('surfaces a top-level string under "value"', () => {
    expect(flat('"hello"')).toEqual({ value: 'hello' });
  });

  it('surfaces a top-level boolean under "value"', () => {
    expect(flat('true')).toEqual({ value: true });
  });

  it('surfaces a top-level null under "value"', () => {
    expect(flat('null')).toEqual({ value: null });
  });

  it('surfaces a top-level empty object under "value"', () => {
    expect(flat('{}')).toEqual({ value: {} });
  });

  it('surfaces a top-level empty array under "value"', () => {
    expect(flat('[]')).toEqual({ value: [] });
  });

  it('flattens a top-level non-empty array with bare bracket keys', () => {
    expect(flat('[1,2]')).toEqual({ '[0]': 1, '[1]': 2 });
  });

  it('flattens a top-level array of objects with bracket+dot keys', () => {
    expect(flat('[{"a":1},{"b":2}]')).toEqual({ '[0].a': 1, '[1].b': 2 });
  });

  it('treats a real empty-string key as the top-level value', () => {
    // key "" with falsy prefix yields path "" which is then surfaced as "value"
    expect(flat('{"":1}')).toEqual({ value: 1 });
  });

  it('handles deeply nested mixed structure', () => {
    const input = '{"user":{"name":"Al","roles":["admin","ops"],"meta":{"age":30}}}';
    expect(flat(input)).toEqual({
      'user.name': 'Al',
      'user.roles[0]': 'admin',
      'user.roles[1]': 'ops',
      'user.meta.age': 30,
    });
  });

  it('preserves unicode and emoji in keys and values', () => {
    expect(flat('{"naïve":"résumé 🚀","emoji😀":1}')).toEqual({
      'naïve': 'résumé 🚀',
      'emoji😀': 1,
    });
  });

  it('preserves keys containing dots and brackets verbatim', () => {
    expect(flat('{"a.b":1,"c[0]":2}')).toEqual({ 'a.b': 1, 'c[0]': 2 });
  });

  it('handles numeric boundaries: zero, negative, large', () => {
    expect(flat('{"zero":0,"neg":-42,"big":1e21}')).toEqual({
      zero: 0,
      neg: -42,
      big: 1e21,
    });
  });

  it('handles a large array deterministically', () => {
    const arr = Array.from({ length: 500 }, (_, i) => i);
    const result = flat(JSON.stringify({ list: arr }));
    expect(Object.keys(result)).toHaveLength(500);
    expect(result['list[0]']).toBe(0);
    expect(result['list[499]']).toBe(499);
  });

  it('produces pretty-printed JSON output with 2-space indentation', () => {
    const out = jsonFlattenLogic.transform('{"a":{"b":1}}');
    expect(out).toBe('{\n  "a.b": 1\n}');
  });

  it('is deterministic for the same input', () => {
    const input = '{"a":{"b":[1,{"c":2}]}}';
    expect(jsonFlattenLogic.transform(input)).toBe(jsonFlattenLogic.transform(input));
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonFlattenLogic.transform('{bad}')).toThrow();
  });

  it('throws on an empty string input', () => {
    expect(() => jsonFlattenLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => jsonFlattenLogic.transform('   \n\t ')).toThrow();
  });

  it('throws on a trailing comma (malformed JSON)', () => {
    expect(() => jsonFlattenLogic.transform('{"a":1,}')).toThrow();
  });
});

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
  it('preserves empty objects and arrays as leaves', () => {
    expect(flat('{"a":{},"b":[]}')).toEqual({ a: {}, b: [] });
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonFlattenLogic.transform('{bad}')).toThrow();
  });
});

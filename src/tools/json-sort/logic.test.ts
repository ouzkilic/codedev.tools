import { describe, it, expect } from 'vitest';
import { jsonSortLogic } from './logic';

describe('jsonSort', () => {
  it('sorts top-level keys alphabetically', () => {
    expect(jsonSortLogic.transform('{"b":1,"a":2}')).toBe('{\n  "a": 2,\n  "b": 1\n}');
  });
  it('sorts keys recursively in nested objects', () => {
    const out = jsonSortLogic.transform('{"z":{"y":1,"x":2}}');
    expect(out).toBe('{\n  "z": {\n    "x": 2,\n    "y": 1\n  }\n}');
  });
  it('preserves array element order', () => {
    expect(jsonSortLogic.transform('[3,1,2]')).toBe('[\n  3,\n  1,\n  2\n]');
  });
  it('sorts keys inside objects within arrays', () => {
    expect(jsonSortLogic.transform('[{"b":1,"a":2}]')).toBe('[\n  {\n    "a": 2,\n    "b": 1\n  }\n]');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonSortLogic.transform('{bad}')).toThrow();
  });
});

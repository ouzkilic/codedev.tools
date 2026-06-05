import { describe, it, expect } from 'vitest';
import { jsonMinifyLogic } from './logic';

describe('jsonMinify', () => {
  it('removes all insignificant whitespace', () => {
    expect(jsonMinifyLogic.transform('{\n  "a": 1,\n  "b": [1, 2]\n}')).toBe('{"a":1,"b":[1,2]}');
  });
  it('preserves whitespace inside string values', () => {
    expect(jsonMinifyLogic.transform('{ "a": "x  y" }')).toBe('{"a":"x  y"}');
  });
  it('handles nested structures', () => {
    expect(jsonMinifyLogic.transform('{ "a": { "b": [ { "c": 1 } ] } }')).toBe('{"a":{"b":[{"c":1}]}}');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonMinifyLogic.transform('{bad}')).toThrow();
  });
});

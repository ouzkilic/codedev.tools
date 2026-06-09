import { describe, it, expect } from 'vitest';
import { jsonMinifyLogic } from './logic';

describe('jsonMinify', () => {
  // --- existing assertions (kept) ---
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

  // --- primitives at the top level ---
  it('minifies a top-level number', () => {
    expect(jsonMinifyLogic.transform('  42  ')).toBe('42');
  });
  it('minifies a top-level string preserving inner spaces', () => {
    expect(jsonMinifyLogic.transform('  "hello world"  ')).toBe('"hello world"');
  });
  it('minifies top-level booleans and null', () => {
    expect(jsonMinifyLogic.transform(' true ')).toBe('true');
    expect(jsonMinifyLogic.transform(' false ')).toBe('false');
    expect(jsonMinifyLogic.transform(' null ')).toBe('null');
  });
  it('minifies an empty object and empty array', () => {
    expect(jsonMinifyLogic.transform('{  }')).toBe('{}');
    expect(jsonMinifyLogic.transform('[\n\n]')).toBe('[]');
  });

  // --- number normalization via parse/stringify ---
  it('normalizes redundant numeric forms', () => {
    expect(jsonMinifyLogic.transform('[1.0, 1e3, 2.50]')).toBe('[1,1000,2.5]');
  });
  it('normalizes negative zero to 0', () => {
    expect(jsonMinifyLogic.transform('-0')).toBe('0');
  });
  it('handles negative numbers and zero', () => {
    expect(jsonMinifyLogic.transform('[-5, 0, -0.25]')).toBe('[-5,0,-0.25]');
  });
  it('handles large integers within safe range', () => {
    expect(jsonMinifyLogic.transform('9007199254740991')).toBe('9007199254740991');
  });

  // --- strings: escapes and unicode ---
  it('preserves emoji and unicode characters literally', () => {
    expect(jsonMinifyLogic.transform('{ "x": "café 🚀" }')).toBe('{"x":"café 🚀"}');
  });
  it('decodes \\uXXXX escapes back to their characters', () => {
    // JSON.parse turns é into é, JSON.stringify emits the raw char.
    expect(jsonMinifyLogic.transform('"\\u00e9"')).toBe('"é"');
  });
  it('preserves required string escapes', () => {
    // newline, tab, quote, backslash inside a string must stay escaped.
    expect(jsonMinifyLogic.transform('"a\\nb\\t\\"c\\\\d"')).toBe('"a\\nb\\t\\"c\\\\d"');
  });
  it('keeps an empty string value', () => {
    expect(jsonMinifyLogic.transform('{ "k": "" }')).toBe('{"k":""}');
  });
  it('preserves a forward slash without escaping', () => {
    expect(jsonMinifyLogic.transform('"a/b"')).toBe('"a/b"');
  });

  // --- object semantics ---
  it('keeps the last value for duplicate keys', () => {
    expect(jsonMinifyLogic.transform('{ "a": 1, "a": 2 }')).toBe('{"a":2}');
  });
  it('preserves key insertion order', () => {
    expect(jsonMinifyLogic.transform('{ "b": 1, "a": 2, "c": 3 }')).toBe('{"b":1,"a":2,"c":3}');
  });

  // --- whitespace / empty input error paths ---
  it('throws on empty string', () => {
    expect(() => jsonMinifyLogic.transform('')).toThrow();
  });
  it('throws on whitespace-only input', () => {
    expect(() => jsonMinifyLogic.transform('   \n\t  ')).toThrow();
  });
  it('throws on trailing comma', () => {
    expect(() => jsonMinifyLogic.transform('[1, 2,]')).toThrow();
  });
  it('throws on single-quoted strings', () => {
    expect(() => jsonMinifyLogic.transform("{ 'a': 1 }")).toThrow();
  });
  it('throws on unquoted keys', () => {
    expect(() => jsonMinifyLogic.transform('{ a: 1 }')).toThrow();
  });
  it('throws on trailing garbage after valid JSON', () => {
    expect(() => jsonMinifyLogic.transform('{} extra')).toThrow();
  });

  // --- large input scaling ---
  it('handles very large arrays', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const pretty = JSON.stringify(arr, null, 2);
    const out = jsonMinifyLogic.transform(pretty);
    expect(out).toBe(JSON.stringify(arr));
    expect(out).not.toContain('\n');
    expect(out.length).toBeLessThan(pretty.length);
  });

  // --- idempotency / determinism ---
  it('is idempotent: minifying an already-minified value is a no-op', () => {
    const once = jsonMinifyLogic.transform('{ "a": [1, 2, 3], "b": "x" }');
    expect(jsonMinifyLogic.transform(once)).toBe(once);
  });
  it('round-trips: parsing the output reproduces the original value', () => {
    const input = '{ "n": 1.5, "s": "hi", "arr": [true, null], "nest": { "k": 7 } }';
    expect(JSON.parse(jsonMinifyLogic.transform(input))).toEqual(JSON.parse(input));
  });
  it('produces output containing no insignificant whitespace separators', () => {
    const out = jsonMinifyLogic.transform('{ "a" : 1 , "b" : 2 }');
    expect(out).toBe('{"a":1,"b":2}');
    expect(out).not.toMatch(/: /);
    expect(out).not.toMatch(/, /);
  });
});

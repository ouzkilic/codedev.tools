import { describe, it, expect } from 'vitest';
import { jsonFormatterLogic } from './logic';

const fmt = (s: string) => jsonFormatterLogic.transform(s);

describe('jsonFormatter', () => {
  // --- existing assertions (kept) ---
  it('indents JSON', () => {
    expect(fmt('{"a":1}')).toBe('{\n  "a": 1\n}');
  });
  it('throws on invalid JSON', () => {
    expect(() => fmt('{bad}')).toThrow();
  });

  // --- happy paths ---
  it('formats an empty object', () => {
    expect(fmt('{}')).toBe('{}');
  });
  it('formats an empty array', () => {
    expect(fmt('[]')).toBe('[]');
  });
  it('formats a non-empty array with 2-space indent', () => {
    expect(fmt('[1,2,3]')).toBe('[\n  1,\n  2,\n  3\n]');
  });
  it('formats nested objects with increasing indent', () => {
    expect(fmt('{"a":{"b":2}}')).toBe('{\n  "a": {\n    "b": 2\n  }\n}');
  });
  it('formats array of objects', () => {
    expect(fmt('[{"x":1}]')).toBe('[\n  {\n    "x": 1\n  }\n]');
  });
  it('preserves key order from the source', () => {
    expect(fmt('{"b":1,"a":2}')).toBe('{\n  "b": 1,\n  "a": 2\n}');
  });

  // --- primitive top-level values ---
  it('formats a top-level string', () => {
    expect(fmt('"hello"')).toBe('"hello"');
  });
  it('formats a top-level number', () => {
    expect(fmt('42')).toBe('42');
  });
  it('formats a top-level boolean', () => {
    expect(fmt('true')).toBe('true');
  });
  it('formats top-level null', () => {
    expect(fmt('null')).toBe('null');
  });

  // --- whitespace tolerance ---
  it('normalizes existing whitespace/indentation', () => {
    expect(fmt('{\n\t"a":  1\n}')).toBe('{\n  "a": 1\n}');
  });
  it('handles leading and trailing whitespace around valid JSON', () => {
    expect(fmt('   {"a":1}   ')).toBe('{\n  "a": 1\n}');
  });

  // --- number boundaries ---
  it('formats negative and zero numbers', () => {
    expect(fmt('{"n":-5,"z":0}')).toBe('{\n  "n": -5,\n  "z": 0\n}');
  });
  it('formats floats and exponential notation (normalized by JSON parse)', () => {
    // 1e3 parses to 1000, 1.5e2 parses to 150
    expect(fmt('[1e3,1.5e2]')).toBe('[\n  1000,\n  150\n]');
  });
  it('preserves large integer values', () => {
    expect(fmt('{"big":9007199254740991}')).toBe('{\n  "big": 9007199254740991\n}');
  });

  // --- unicode / emoji / special chars ---
  it('preserves unicode and emoji in string values', () => {
    expect(fmt('{"s":"héllo 😀 漢字"}')).toBe('{\n  "s": "héllo 😀 漢字"\n}');
  });
  it('preserves escaped control chars in strings', () => {
    expect(fmt('{"s":"a\\nb\\t\\"c\\""}')).toBe('{\n  "s": "a\\nb\\t\\"c\\""\n}');
  });

  // --- large input ---
  it('formats a large array deterministically', () => {
    const arr = Array.from({ length: 500 }, (_, i) => i);
    const out = fmt(JSON.stringify(arr));
    expect(out.startsWith('[\n  0,\n  1,')).toBe(true);
    expect(out.endsWith('  499\n]')).toBe(true);
    expect(out.split('\n').length).toBe(502); // 500 items + opening + closing
  });

  // --- determinism / idempotency ---
  it('is deterministic across calls', () => {
    expect(fmt('{"a":1,"b":[2,3]}')).toBe(fmt('{"a":1,"b":[2,3]}'));
  });
  it('is idempotent: formatting already-formatted output is a no-op', () => {
    const once = fmt('{"a":1,"b":{"c":2}}');
    expect(fmt(once)).toBe(once);
  });
  it('round-trips: parsed output equals parsed input', () => {
    const input = '{"a":1,"b":[true,null,"x"]}';
    expect(JSON.parse(fmt(input))).toEqual(JSON.parse(input));
  });

  // --- error paths ---
  it('throws on empty string', () => {
    expect(() => fmt('')).toThrow();
  });
  it('throws on whitespace-only input', () => {
    expect(() => fmt('   \n\t ')).toThrow();
  });
  it('throws on trailing comma', () => {
    expect(() => fmt('{"a":1,}')).toThrow();
  });
  it('throws on single-quoted keys/values', () => {
    expect(() => fmt("{'a':1}")).toThrow();
  });
  it('throws on unquoted keys', () => {
    expect(() => fmt('{a:1}')).toThrow();
  });
  it('throws on trailing garbage after valid JSON', () => {
    expect(() => fmt('{"a":1} extra')).toThrow();
  });
});

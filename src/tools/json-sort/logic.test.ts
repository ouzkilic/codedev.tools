import { describe, it, expect } from 'vitest';
import { jsonSortLogic } from './logic';

describe('jsonSort', () => {
  // ---- existing assertions (kept) ----
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

  // ---- primitives pass through unchanged ----
  it('handles a bare string value', () => {
    expect(jsonSortLogic.transform('"hello"')).toBe('"hello"');
  });
  it('handles a bare number value', () => {
    expect(jsonSortLogic.transform('42')).toBe('42');
  });
  it('handles a bare boolean value', () => {
    expect(jsonSortLogic.transform('true')).toBe('true');
  });
  it('handles a bare null value', () => {
    expect(jsonSortLogic.transform('null')).toBe('null');
  });

  // ---- empty containers ----
  it('renders an empty object', () => {
    expect(jsonSortLogic.transform('{}')).toBe('{}');
  });
  it('renders an empty array', () => {
    expect(jsonSortLogic.transform('[]')).toBe('[]');
  });
  it('renders nested empty containers', () => {
    expect(jsonSortLogic.transform('{"a":{},"b":[]}')).toBe(
      '{\n  "a": {},\n  "b": []\n}',
    );
  });

  // ---- whitespace tolerance: JSON.parse ignores surrounding whitespace ----
  it('tolerates surrounding whitespace in input', () => {
    expect(jsonSortLogic.transform('  \n {"b":1,"a":2}  \t ')).toBe(
      '{\n  "a": 2,\n  "b": 1\n}',
    );
  });

  // ---- key ordering follows default String.sort (UTF-16 code units) ----
  it('orders uppercase keys before lowercase keys (ASCII order)', () => {
    // 'B' (66) < 'a' (97) in code-unit order
    expect(jsonSortLogic.transform('{"a":1,"B":2}')).toBe('{\n  "B": 2,\n  "a": 1\n}');
  });
  it('orders numeric-string keys before alphabetic keys', () => {
    // '1' (49) < 'a' (97)
    expect(jsonSortLogic.transform('{"a":1,"1":2}')).toBe('{\n  "1": 2,\n  "a": 1\n}');
  });
  it('orders integer-like keys in numeric ascending order (JS engine ordering)', () => {
    // Although the code calls .sort() (lexicographic, which would give 1,10,2),
    // integer-index-like string keys are re-ordered numerically by the JS engine
    // when the result object is built, so the emitted order is 1,2,10.
    const out = jsonSortLogic.transform('{"2":"a","10":"b","1":"c"}');
    expect(out).toBe('{\n  "1": "c",\n  "2": "a",\n  "10": "b"\n}');
  });

  // ---- value types preserved & formatted ----
  it('preserves mixed value types with their formatting', () => {
    const out = jsonSortLogic.transform('{"n":3.14,"s":"x","b":false,"z":null}');
    expect(out).toBe('{\n  "b": false,\n  "n": 3.14,\n  "s": "x",\n  "z": null\n}');
  });
  it('keeps array order while sorting objects inside it (mixed array)', () => {
    const out = jsonSortLogic.transform('[2,{"d":1,"c":2},1]');
    expect(out).toBe('[\n  2,\n  {\n    "c": 2,\n    "d": 1\n  },\n  1\n]');
  });

  // ---- deeply nested recursion ----
  it('sorts keys at every depth', () => {
    const out = jsonSortLogic.transform('{"x":{"deep":{"b":1,"a":2}},"a":1}');
    expect(out).toBe(
      '{\n  "a": 1,\n  "x": {\n    "deep": {\n      "a": 2,\n      "b": 1\n    }\n  }\n}',
    );
  });

  // ---- unicode / emoji keys and values ----
  it('handles unicode and emoji in keys and values', () => {
    const out = jsonSortLogic.transform('{"ä":"value","🚀":"rocket","a":"plain"}');
    const parsed = JSON.parse(out) as Record<string, string>;
    expect(parsed['🚀']).toBe('rocket');
    expect(parsed['ä']).toBe('value');
    expect(parsed['a']).toBe('plain');
    // ASCII 'a' sorts before higher code points 'ä' and emoji
    expect(out.indexOf('"a"')).toBeLessThan(out.indexOf('"ä"'));
  });

  // ---- special characters escaped by JSON.stringify ----
  it('escapes special characters in string values', () => {
    const out = jsonSortLogic.transform('{"k":"line1\\nline2\\t\\"q\\""}');
    expect(out).toContain('\\n');
    expect(out).toContain('\\t');
    expect(out).toContain('\\"q\\"');
  });

  // ---- numeric boundaries ----
  it('handles zero, negative, and large/small numbers', () => {
    const out = jsonSortLogic.transform('{"neg":-5,"zero":0,"big":1e21,"small":-0.0001}');
    const parsed = JSON.parse(out) as Record<string, number>;
    expect(parsed.neg).toBe(-5);
    expect(parsed.zero).toBe(0);
    expect(parsed.big).toBe(1e21);
    expect(parsed.small).toBe(-0.0001);
  });

  // ---- determinism / idempotency ----
  it('is deterministic across repeated calls', () => {
    const input = '{"c":1,"a":2,"b":3}';
    expect(jsonSortLogic.transform(input)).toBe(jsonSortLogic.transform(input));
  });
  it('is idempotent: sorting already-sorted output yields the same result', () => {
    const once = jsonSortLogic.transform('{"c":{"z":1,"y":2},"a":3,"b":4}');
    const twice = jsonSortLogic.transform(once);
    expect(twice).toBe(once);
  });
  it('produces sorted output regardless of original key order', () => {
    const a = jsonSortLogic.transform('{"a":1,"b":2,"c":3}');
    const b = jsonSortLogic.transform('{"c":3,"b":2,"a":1}');
    expect(a).toBe(b);
  });

  // ---- round-trip: sorted output parses back to an equal object ----
  it('round-trips: output parses to a value deep-equal to the input value', () => {
    const inputObj = { b: [1, 2, { d: 4, c: 3 }], a: { y: 'Y', x: 'X' } };
    const out = jsonSortLogic.transform(JSON.stringify(inputObj));
    expect(JSON.parse(out)).toEqual(inputObj);
  });

  // ---- large input stress (still deterministic) ----
  it('handles a large object with many keys', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj['key' + i] = i;
    const out = jsonSortLogic.transform(JSON.stringify(obj));
    const keys = Object.keys(JSON.parse(out) as Record<string, number>);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
    expect(keys).toHaveLength(500);
  });

  // ---- error paths ----
  it('throws on empty string input', () => {
    expect(() => jsonSortLogic.transform('')).toThrow();
  });
  it('throws on whitespace-only input', () => {
    expect(() => jsonSortLogic.transform('   \n\t  ')).toThrow();
  });
  it('throws on trailing comma (invalid JSON)', () => {
    expect(() => jsonSortLogic.transform('{"a":1,}')).toThrow();
  });
  it('throws on single-quoted keys (invalid JSON)', () => {
    expect(() => jsonSortLogic.transform("{'a':1}")).toThrow();
  });
  it('throws on a bare unquoted word', () => {
    expect(() => jsonSortLogic.transform('undefined')).toThrow();
  });
});

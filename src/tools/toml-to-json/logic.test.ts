import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { tomlToJsonLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const toObj = (s: string) => JSON.parse(tomlToJsonLogic.transform(s));

describe('tomlToJson', () => {
  it('parses top-level keys', () => {
    expect(toObj('title = "x"')).toEqual({ title: 'x' });
  });

  it('parses tables into nested objects', () => {
    expect(toObj('[owner]\nname = "Ada"')).toEqual({ owner: { name: 'Ada' } });
  });

  it('parses numbers and arrays', () => {
    expect(toObj('n = 42\nlist = [1, 2, 3]')).toEqual({ n: 42, list: [1, 2, 3] });
  });

  it('parses booleans', () => {
    expect(toObj('a = true\nb = false')).toEqual({ a: true, b: false });
  });

  it('parses floats', () => {
    expect(toObj('f = 3.14')).toEqual({ f: 3.14 });
  });

  it('parses integers with underscores and hex notation', () => {
    expect(toObj('a = 1_000\nb = 0xFF')).toEqual({ a: 1000, b: 255 });
  });

  it('parses dotted keys into nested objects', () => {
    expect(toObj('a.b.c = 1')).toEqual({ a: { b: { c: 1 } } });
  });

  it('parses quoted keys containing spaces', () => {
    expect(toObj('"a b" = 1')).toEqual({ 'a b': 1 });
  });

  it('parses inline tables', () => {
    expect(toObj('p = { x = 1, y = 2 }')).toEqual({ p: { x: 1, y: 2 } });
  });

  it('parses arrays of tables', () => {
    expect(toObj('[[p]]\nn = 1\n[[p]]\nn = 2')).toEqual({ p: [{ n: 1 }, { n: 2 }] });
  });

  it('parses multi-line basic strings preserving newlines', () => {
    expect(toObj('s = """a\nb"""')).toEqual({ s: 'a\nb' });
  });

  it('parses offset date-times into ISO strings', () => {
    expect(toObj('d = 1979-05-27T07:32:00Z')).toEqual({ d: '1979-05-27T07:32:00.000Z' });
  });

  it('parses local dates as plain strings', () => {
    expect(toObj('d = 1979-05-27')).toEqual({ d: '1979-05-27' });
  });

  it('passes ToolContext through without affecting output (ctx ignored)', () => {
    const withCtx = tomlToJsonLogic.transform('title = "x"', ctx);
    const without = tomlToJsonLogic.transform('title = "x"');
    expect(withCtx).toBe(without);
  });

  it('preserves unicode and emoji in values', () => {
    expect(toObj('e = "héllo 😀 日本語"')).toEqual({ e: 'héllo 😀 日本語' });
  });

  it('returns an empty object for empty input', () => {
    expect(toObj('')).toEqual({});
  });

  it('returns an empty object for whitespace-only input', () => {
    expect(toObj('   \n  \n')).toEqual({});
  });

  it('returns an empty object for comment-only input', () => {
    expect(toObj('# just a comment')).toEqual({});
  });

  it('pretty-prints output with two-space indentation', () => {
    const out = tomlToJsonLogic.transform('[owner]\nname = "Ada"');
    expect(out).toBe('{\n  "owner": {\n    "name": "Ada"\n  }\n}');
  });

  it('handles a large document with many keys', () => {
    const lines = Array.from({ length: 500 }, (_, i) => `k${i} = ${i}`).join('\n');
    const obj = toObj(lines);
    expect(Object.keys(obj)).toHaveLength(500);
    expect(obj.k499).toBe(499);
  });

  it('round-trips a structure: TOML -> JSON object remains stable when re-stringified', () => {
    const out1 = tomlToJsonLogic.transform('a = 1\n[t]\nb = "y"');
    const out2 = JSON.stringify(JSON.parse(out1), null, 2);
    expect(out1).toBe(out2);
  });

  it('throws on invalid TOML', () => {
    expect(() => tomlToJsonLogic.transform('= broken')).toThrow();
  });

  it('throws on duplicate key definitions', () => {
    expect(() => tomlToJsonLogic.transform('a = 1\na = 2')).toThrow();
  });

  it('throws on integers that cannot be represented losslessly', () => {
    expect(() => tomlToJsonLogic.transform('n = 9223372036854775807')).toThrow();
  });
});

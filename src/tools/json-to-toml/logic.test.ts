import { describe, it, expect } from 'vitest';
import { parse } from 'smol-toml';
import { jsonToTomlLogic } from './logic';

describe('jsonToToml', () => {
  // --- happy paths ---
  it('serializes top-level keys', () => {
    expect(jsonToTomlLogic.transform('{"title":"x"}')).toBe('title = "x"\n');
  });

  it('serializes nested objects as tables', () => {
    const out = jsonToTomlLogic.transform('{"owner":{"name":"Ada"}}');
    expect(out).toContain('[owner]');
    expect(out).toContain('name = "Ada"');
    expect(out).toBe('[owner]\nname = "Ada"\n');
  });

  it('serializes integers without quotes', () => {
    expect(jsonToTomlLogic.transform('{"a":1}')).toBe('a = 1\n');
  });

  it('serializes floats preserving decimal', () => {
    expect(jsonToTomlLogic.transform('{"pi":3.14159}')).toBe('pi = 3.14159\n');
    expect(jsonToTomlLogic.transform('{"a":1.5}')).toBe('a = 1.5\n');
  });

  it('serializes booleans as bare true/false', () => {
    expect(jsonToTomlLogic.transform('{"a":true,"b":false}')).toBe('a = true\nb = false\n');
  });

  it('serializes numeric arrays inline with spaced brackets', () => {
    expect(jsonToTomlLogic.transform('{"nums":[1,2,3]}')).toBe('nums = [ 1, 2, 3 ]\n');
  });

  it('serializes string arrays inline', () => {
    expect(jsonToTomlLogic.transform('{"tags":["a","b"]}')).toBe('tags = [ "a", "b" ]\n');
  });

  it('serializes nested arrays of arrays', () => {
    expect(jsonToTomlLogic.transform('{"a":[[1,2],[3,4]]}')).toBe('a = [ [ 1, 2 ], [ 3, 4 ] ]\n');
  });

  it('serializes arrays of objects as array-of-tables', () => {
    const out = jsonToTomlLogic.transform('{"servers":[{"ip":"10.0.0.1"},{"ip":"10.0.0.2"}]}');
    expect(out).toContain('[[servers]]');
    expect(out).toBe('[[servers]]\nip = "10.0.0.1"\n\n[[servers]]\nip = "10.0.0.2"\n');
  });

  it('serializes deeply nested objects as dotted table headers', () => {
    expect(jsonToTomlLogic.transform('{"a":{"b":{"c":{"d":1}}}}')).toBe('[a.b.c]\nd = 1\n');
  });

  // --- edge cases ---
  it('serializes an empty object to a lone newline', () => {
    expect(jsonToTomlLogic.transform('{}')).toBe('\n');
  });

  it('serializes empty arrays as []', () => {
    expect(jsonToTomlLogic.transform('{"arr":[]}')).toBe('arr = []\n');
  });

  it('handles negative numbers and zero', () => {
    expect(jsonToTomlLogic.transform('{"n":-5,"z":0}')).toBe('n = -5\nz = 0\n');
  });

  it('handles large safe integers', () => {
    expect(jsonToTomlLogic.transform('{"big":9007199254740991}')).toBe('big = 9007199254740991\n');
  });

  it('preserves unicode and emoji in string values', () => {
    const out = jsonToTomlLogic.transform('{"emoji":"😀","jp":"日本"}');
    expect(out).toContain('emoji = "😀"');
    expect(out).toContain('jp = "日本"');
  });

  it('escapes quotes and newlines inside strings', () => {
    const out = jsonToTomlLogic.transform(JSON.stringify({ q: 'he said "hi"\nnew' }));
    expect(out).toBe('q = "he said \\"hi\\"\\nnew"\n');
  });

  it('quotes keys that contain dots', () => {
    expect(jsonToTomlLogic.transform('{"a.b":"x"}')).toBe('"a.b" = "x"\n');
  });

  it('quotes keys that contain spaces', () => {
    expect(jsonToTomlLogic.transform('{"a b":"x"}')).toBe('"a b" = "x"\n');
  });

  it('ignores ctx options/secondary (single-input tool)', () => {
    const a = jsonToTomlLogic.transform('{"a":1}');
    const b = jsonToTomlLogic.transform('{"a":1}', { options: { foo: 'bar' }, secondary: 'ignored' });
    expect(a).toBe(b);
  });

  it('handles very large objects', () => {
    const big: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) big['k' + i] = i;
    const out = jsonToTomlLogic.transform(JSON.stringify(big));
    expect(out).toContain('k0 = 0');
    expect(out).toContain('k999 = 999');
    expect(out.trimEnd().split('\n')).toHaveLength(1000);
  });

  // --- determinism / round-trip ---
  it('is deterministic for identical input', () => {
    const input = '{"title":"x","owner":{"name":"Ada"},"tags":["a","b"],"active":true}';
    expect(jsonToTomlLogic.transform(input)).toBe(jsonToTomlLogic.transform(input));
  });

  it('round-trips through smol-toml parse (structural equality)', () => {
    const obj = { title: 'x', owner: { name: 'Ada' }, tags: ['a', 'b'], active: true };
    const out = jsonToTomlLogic.transform(JSON.stringify(obj));
    expect(parse(out)).toEqual(obj);
  });

  it('round-trips numeric values without type loss', () => {
    const obj = { a: 1, b: 2.5, c: -3 };
    const out = jsonToTomlLogic.transform(JSON.stringify(obj));
    expect(parse(out)).toEqual(obj);
  });

  // --- error paths ---
  it('throws when the root is an array', () => {
    expect(() => jsonToTomlLogic.transform('[1,2]')).toThrow('TOML requires a top-level JSON object.');
  });

  it('throws when the root is null', () => {
    expect(() => jsonToTomlLogic.transform('null')).toThrow('TOML requires a top-level JSON object.');
  });

  it('throws when the root is a string primitive', () => {
    expect(() => jsonToTomlLogic.transform('"hello"')).toThrow('TOML requires a top-level JSON object.');
  });

  it('throws when the root is a number primitive', () => {
    expect(() => jsonToTomlLogic.transform('42')).toThrow('TOML requires a top-level JSON object.');
  });

  it('throws when the root is a boolean primitive', () => {
    expect(() => jsonToTomlLogic.transform('true')).toThrow('TOML requires a top-level JSON object.');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToTomlLogic.transform('{bad}')).toThrow();
  });

  it('throws on empty string input', () => {
    expect(() => jsonToTomlLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => jsonToTomlLogic.transform('   \n\t ')).toThrow();
  });
});

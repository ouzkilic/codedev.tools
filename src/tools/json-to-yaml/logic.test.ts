import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { jsonToYamlLogic } from './logic';

const transform = (input: string) => jsonToYamlLogic.transform(input);

describe('jsonToYaml', () => {
  // --- existing assertions (kept) ---
  it('dumps objects and arrays to YAML', () => {
    expect(transform('{"a":1,"b":[1,2]}')).toBe('a: 1\nb:\n  - 1\n  - 2\n');
  });

  it('nests mappings with indentation', () => {
    const out = transform('{"outer":{"inner":"hello"}}');
    expect(out).toContain('outer:');
    expect(out).toContain('inner: hello');
  });

  it('throws on invalid JSON', () => {
    expect(() => transform('{bad}')).toThrow();
  });

  // --- scalar / primitive roots ---
  it('dumps a bare number', () => {
    expect(transform('42')).toBe('42\n');
  });

  it('dumps a bare negative float', () => {
    expect(transform('-3.14')).toBe('-3.14\n');
  });

  it('dumps zero', () => {
    expect(transform('0')).toBe('0\n');
  });

  it('dumps a bare boolean', () => {
    expect(transform('true')).toBe('true\n');
  });

  it('dumps JSON null as the literal null', () => {
    expect(transform('null')).toBe('null\n');
  });

  it('dumps a bare string scalar', () => {
    expect(transform('"hello"')).toBe('hello\n');
  });

  it('quotes a string that looks like a YAML boolean keyword', () => {
    // js-yaml quotes "yes" so it is not re-read as a boolean on load
    expect(transform('{"k":"yes"}')).toBe("k: 'yes'\n");
  });

  it('quotes a string that looks like a number', () => {
    expect(transform('"123"')).toBe("'123'\n");
  });

  it('quotes the string "null" so it stays a string', () => {
    expect(transform('"null"')).toBe("'null'\n");
  });

  it('preserves a large integer at the safe-integer boundary', () => {
    expect(transform('9007199254740991')).toBe('9007199254740991\n');
  });

  // --- empty / containers ---
  it('dumps an empty object as flow style {}', () => {
    expect(transform('{}')).toBe('{}\n');
  });

  it('dumps an empty array as flow style []', () => {
    expect(transform('[]')).toBe('[]\n');
  });

  it('dumps an array of strings as a block sequence', () => {
    expect(transform('["x","y"]')).toContain('- x');
  });

  // --- structure / nesting ---
  it('indents deeply nested mappings progressively', () => {
    expect(transform('{"a":{"b":{"c":"x"}}}')).toBe('a:\n  b:\n    c: x\n');
  });

  it('renders an array of objects as a sequence of mappings', () => {
    expect(transform('{"a":[{"b":2}]}')).toBe('a:\n  - b: 2\n');
  });

  it('preserves insertion order of keys (does not sort)', () => {
    expect(transform('{"z":1,"a":2}')).toBe('z: 1\na: 2\n');
  });

  // --- unicode / special characters ---
  it('keeps emoji content intact', () => {
    expect(transform('{"e":"😀"}')).toBe('e: 😀\n');
  });

  it('keeps unicode keys intact', () => {
    expect(transform('{"café":1}')).toBe('café: 1\n');
  });

  it('uses block scalar (|-) for multiline strings', () => {
    const out = transform('{"k":"line1\\nline2"}');
    expect(out).toContain('k: |-');
    expect(out).toContain('  line1');
    expect(out).toContain('  line2');
  });

  it('quotes a value containing a colon so it is not parsed as a mapping', () => {
    expect(transform('{"k":"a: b"}')).toBe("k: 'a: b'\n");
  });

  // --- error paths ---
  it('throws on an empty string (not valid JSON)', () => {
    expect(() => transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => transform('   ')).toThrow();
  });

  it('throws on the literal undefined (not valid JSON)', () => {
    expect(() => transform('undefined')).toThrow();
  });

  it('throws on a trailing comma', () => {
    expect(() => transform('{"a":1,}')).toThrow();
  });

  it('throws on single-quoted keys (not valid JSON)', () => {
    expect(() => transform("{'a':1}")).toThrow();
  });

  // --- round-trip / determinism ---
  it('round-trips a rich object: dump then load equals the parsed input', () => {
    const json = '{"a":1,"b":[1,2,3],"c":{"d":true},"e":null,"f":"text"}';
    const out = transform(json);
    expect(yaml.load(out)).toEqual(JSON.parse(json));
  });

  it('is deterministic for identical input', () => {
    const json = '{"z":1,"a":2,"nested":{"x":[1,2]}}';
    expect(transform(json)).toBe(transform(json));
  });

  it('handles large input without truncating entries', () => {
    const big: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) big['k' + i] = i;
    const out = transform(JSON.stringify(big));
    expect(out).toContain('k0: 0');
    expect(out).toContain('k999: 999');
    expect(out.trim().split('\n')).toHaveLength(1000);
  });

  it('tolerates leading/trailing whitespace around valid JSON', () => {
    expect(transform('  {"a":1}  ')).toBe('a: 1\n');
  });
});

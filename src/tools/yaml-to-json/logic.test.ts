import { describe, it, expect } from 'vitest';
import { yamlToJsonLogic } from './logic';

describe('yamlToJson', () => {
  it('converts scalars and sequences', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('a: 1\nb:\n  - 1\n  - 2'))).toEqual({ a: 1, b: [1, 2] });
  });

  it('converts nested mappings', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('x:\n  y: hello'))).toEqual({ x: { y: 'hello' } });
  });

  it('throws on invalid YAML', () => {
    expect(() => yamlToJsonLogic.transform('a:\n - 1\n- 2')).toThrow();
  });

  it('pretty-prints output with 2-space indentation', () => {
    const out = yamlToJsonLogic.transform('a: 1\nb: 2');
    expect(out).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('converts a top-level scalar string', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('just a string'))).toBe('just a string');
  });

  it('converts a top-level sequence to a JSON array', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('- one\n- two\n- three'))).toEqual(['one', 'two', 'three']);
  });

  it('parses flow-style (inline) collections', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('{a: 1, b: [2, 3]}'))).toEqual({ a: 1, b: [2, 3] });
  });

  it('preserves YAML 1.2 scalar typing (numbers, hex, null, bool words)', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('a: yes\nb: 3.14\nc: 0x1A\nd: ~\ne: true'))).toEqual({
      a: 'yes',
      b: 3.14,
      c: 26,
      d: null,
      e: true,
    });
  });

  it('handles deeply nested structures', () => {
    const out = JSON.parse(yamlToJsonLogic.transform('root:\n  level1:\n    level2:\n      - a\n      - b'));
    expect(out).toEqual({ root: { level1: { level2: ['a', 'b'] } } });
  });

  it('preserves unicode and emoji in string values', () => {
    const out = JSON.parse(yamlToJsonLogic.transform('msg: "hello 🚀 dünya"'));
    expect(out).toEqual({ msg: 'hello 🚀 dünya' });
  });

  it('converts an empty mapping and empty sequence', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('a: {}\nb: []'))).toEqual({ a: {}, b: [] });
  });

  it('treats an explicit null as JSON null', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('null'))).toBeNull();
  });

  it('treats a comment-only document as null', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('# only a comment'))).toBeNull();
  });

  it('returns undefined (no JSON text) for empty input', () => {
    // JSON.stringify(undefined, ...) yields the JS value undefined, not a string.
    expect(yamlToJsonLogic.transform('')).toBeUndefined();
  });

  it('treats a blank multi-line document as null', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('   \n   '))).toBeNull();
  });

  it('throws on a multi-document YAML stream', () => {
    expect(() => yamlToJsonLogic.transform('a: 1\n---\nb: 2')).toThrow();
  });

  it('throws on tab-based indentation', () => {
    expect(() => yamlToJsonLogic.transform('a:\n\t- 1')).toThrow();
  });

  it('throws on duplicate mapping keys', () => {
    expect(() => yamlToJsonLogic.transform('a: 1\na: 2')).toThrow();
  });

  it('round-trips through JSON-as-YAML (JSON is valid YAML)', () => {
    const original = { name: 'svc', port: 8080, tags: ['x', 'y'], nested: { ok: true } };
    const asYaml = JSON.stringify(original);
    expect(JSON.parse(yamlToJsonLogic.transform(asYaml))).toEqual(original);
  });

  it('handles a large mapping without truncation', () => {
    const lines = Array.from({ length: 500 }, (_, i) => `key${i}: ${i}`).join('\n');
    const parsed = JSON.parse(yamlToJsonLogic.transform(lines));
    expect(Object.keys(parsed)).toHaveLength(500);
    expect(parsed.key499).toBe(499);
  });
});

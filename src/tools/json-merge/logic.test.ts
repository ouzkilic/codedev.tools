import { describe, it, expect } from 'vitest';
import { jsonMergeLogic } from './logic';

// Raw transform helper preserving the formatted string output.
const transform = (a: string, b?: string): string =>
  jsonMergeLogic.transform(a, { options: {}, secondary: b ?? '' });

// Parsed merge result for structural assertions.
const merge = (a: string, b: string) => JSON.parse(transform(a, b));

describe('jsonMerge', () => {
  // --- existing assertions (kept) ---
  it('combines disjoint keys', () => {
    expect(merge('{"a":1}', '{"b":2}')).toEqual({ a: 1, b: 2 });
  });
  it('merges nested objects recursively', () => {
    expect(merge('{"a":{"x":1}}', '{"a":{"y":2}}')).toEqual({ a: { x: 1, y: 2 } });
  });
  it('lets source override target for conflicting primitives', () => {
    expect(merge('{"a":1}', '{"a":2}')).toEqual({ a: 2 });
  });
  it('replaces arrays rather than concatenating them', () => {
    expect(merge('{"a":[1,2]}', '{"a":[3]}')).toEqual({ a: [3] });
  });
  it('returns the target unchanged when source is empty', () => {
    expect(merge('{"a":1}', '')).toEqual({ a: 1 });
  });
  it('throws on invalid source JSON', () => {
    expect(() => transform('{"a":1}', '{bad}')).toThrow();
  });

  // --- formatting / no-source behavior ---
  it('formats the target with 2-space indentation when no source is given', () => {
    expect(transform('{"a":1,"b":2}')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });
  it('treats whitespace-only source as empty and just formats the target', () => {
    expect(transform('{"a":1}', '   \n\t  ')).toBe('{\n  "a": 1\n}');
  });
  it('formats a top-level primitive target with no source', () => {
    expect(transform('42')).toBe('42');
    expect(transform('"hi"')).toBe('"hi"');
    expect(transform('null')).toBe('null');
    expect(transform('true')).toBe('true');
  });
  it('formats a nested structure with proper indentation', () => {
    expect(transform('{"a":{"b":[1,2]}}')).toBe(
      '{\n  "a": {\n    "b": [\n      1,\n      2\n    ]\n  }\n}',
    );
  });

  // --- deep merge branches ---
  it('merges multiple levels of nesting recursively', () => {
    expect(merge('{"a":{"b":{"c":1}}}', '{"a":{"b":{"d":2}}}')).toEqual({
      a: { b: { c: 1, d: 2 } },
    });
  });
  it('adds new nested keys from source without dropping target keys', () => {
    expect(merge('{"a":{"x":1},"keep":true}', '{"a":{"y":2}}')).toEqual({
      a: { x: 1, y: 2 },
      keep: true,
    });
  });
  it('replaces a target object with a source array at the same key', () => {
    expect(merge('{"a":{"x":1}}', '{"a":[1,2]}')).toEqual({ a: [1, 2] });
  });
  it('replaces a target object with a source primitive at the same key', () => {
    expect(merge('{"a":{"x":1}}', '{"a":5}')).toEqual({ a: 5 });
  });
  it('replaces a target primitive with a source object at the same key', () => {
    expect(merge('{"a":5}', '{"a":{"x":1}}')).toEqual({ a: { x: 1 } });
  });
  it('replaces a target array with a source object at the same key', () => {
    expect(merge('{"a":[1,2]}', '{"a":{"x":1}}')).toEqual({ a: { x: 1 } });
  });
  it('overrides a value with explicit null from source', () => {
    expect(merge('{"a":1}', '{"a":null}')).toEqual({ a: null });
  });
  it('merges into an empty target object', () => {
    expect(merge('{}', '{"a":1}')).toEqual({ a: 1 });
  });
  it('leaves target intact when source object is empty', () => {
    expect(merge('{"a":1,"b":{"c":2}}', '{}')).toEqual({ a: 1, b: { c: 2 } });
  });

  // --- top-level non-object merges ---
  it('replaces a top-level primitive target with a top-level source primitive', () => {
    expect(merge('1', '2')).toEqual(2);
  });
  it('replaces a top-level array target with a top-level source array', () => {
    expect(merge('[1,2,3]', '[4]')).toEqual([4]);
  });
  it('replaces a top-level object target with a top-level array source', () => {
    expect(merge('{"a":1}', '[1,2]')).toEqual([1, 2]);
  });

  // --- edge: numeric / unicode / special chars ---
  it('preserves number boundaries: zero, negative, and floats', () => {
    expect(merge('{"a":1}', '{"z":0,"n":-5,"f":3.14}')).toEqual({
      a: 1,
      z: 0,
      n: -5,
      f: 3.14,
    });
  });
  it('handles unicode and emoji keys and values', () => {
    expect(merge('{"naïve":"café"}', '{"emoji":"😀🚀"}')).toEqual({
      'naïve': 'café',
      emoji: '😀🚀',
    });
  });
  it('preserves special characters that require JSON escaping', () => {
    const out = merge('{"a":"line1\\nline2\\t\\"q\\""}', '{}');
    expect(out).toEqual({ a: 'line1\nline2\t"q"' });
  });

  // --- determinism / idempotency ---
  it('is deterministic across repeated calls', () => {
    const a = transform('{"a":{"x":1}}', '{"a":{"y":2}}');
    const b = transform('{"a":{"x":1}}', '{"a":{"y":2}}');
    expect(a).toBe(b);
  });
  it('is idempotent when merging an object into itself', () => {
    expect(merge('{"a":{"x":1},"b":2}', '{"a":{"x":1},"b":2}')).toEqual({
      a: { x: 1 },
      b: 2,
    });
  });

  // --- large input ---
  it('merges a large object without losing keys', () => {
    const targetObj: Record<string, number> = {};
    const sourceObj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) targetObj[`t${i}`] = i;
    for (let i = 0; i < 500; i++) sourceObj[`s${i}`] = i;
    const out = merge(JSON.stringify(targetObj), JSON.stringify(sourceObj));
    expect(Object.keys(out)).toHaveLength(1000);
    expect(out.t0).toBe(0);
    expect(out.s499).toBe(499);
  });

  // --- error paths ---
  it('throws on invalid target JSON', () => {
    expect(() => transform('{bad}', '{"a":1}')).toThrow();
  });
  it('throws on empty target input', () => {
    expect(() => transform('', '{"a":1}')).toThrow();
  });
  it('throws on whitespace-only target input', () => {
    expect(() => transform('   ', '')).toThrow();
  });
  it('throws on trailing garbage after valid target JSON', () => {
    expect(() => transform('{"a":1} extra', '')).toThrow();
  });
});

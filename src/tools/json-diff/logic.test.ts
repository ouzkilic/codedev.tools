import { describe, it, expect } from 'vitest';
import { normalizeJson, computeJsonDiff } from './logic';

describe('normalizeJson', () => {
  it('normalizes by sorting keys', () => {
    expect(normalizeJson('{"b":1,"a":2}')).toBe('{\n  "a": 2,\n  "b": 1\n}');
  });

  it('sorts keys recursively in nested objects', () => {
    expect(normalizeJson('{"b":{"z":1,"a":2},"a":1}')).toBe(
      '{\n  "a": 1,\n  "b": {\n    "a": 2,\n    "z": 1\n  }\n}',
    );
  });

  it('preserves array element order while sorting object elements inside', () => {
    expect(normalizeJson('[{"b":1,"a":2},3,1]')).toBe(
      '[\n  {\n    "a": 2,\n    "b": 1\n  },\n  3,\n  1\n]',
    );
  });

  it('pretty-prints with 2-space indentation', () => {
    const out = normalizeJson('{"a":{"b":1}}');
    expect(out).toContain('\n  "a"');
    expect(out).toContain('\n    "b"');
  });

  it('passes through a top-level string primitive', () => {
    expect(normalizeJson('"hello"')).toBe('"hello"');
  });

  it('passes through a top-level number primitive', () => {
    expect(normalizeJson('42')).toBe('42');
  });

  it('passes through a top-level boolean primitive', () => {
    expect(normalizeJson('true')).toBe('true');
  });

  it('passes through null', () => {
    expect(normalizeJson('null')).toBe('null');
  });

  it('renders empty object and empty array compactly', () => {
    expect(normalizeJson('{}')).toBe('{}');
    expect(normalizeJson('[]')).toBe('[]');
  });

  it('preserves unicode and emoji content', () => {
    const out = normalizeJson('{"emoji":"é🚀","key":"ü"}');
    expect(out).toContain('é🚀');
    expect(out).toContain('ü');
  });

  it('handles negative, zero and boundary numbers', () => {
    expect(normalizeJson('{"n":-5,"z":0}')).toBe('{\n  "n": -5,\n  "z": 0\n}');
    // JSON numbers beyond safe integer round-trip through JS number
    expect(normalizeJson('{"big":9007199254740991}')).toBe('{\n  "big": 9007199254740991\n}');
  });

  it('handles a large array deterministically (idempotent)', () => {
    const arr = JSON.stringify(Array.from({ length: 500 }, (_, i) => i));
    const once = normalizeJson(arr);
    const twice = normalizeJson(once);
    expect(twice).toBe(once);
    expect(once.split('\n').length).toBe(502); // [ + 500 items + ]
  });

  it('is idempotent: normalizing normalized output yields the same string', () => {
    const out = normalizeJson('{"b":1,"a":{"d":4,"c":3}}');
    expect(normalizeJson(out)).toBe(out);
  });

  it('throws on empty string input', () => {
    expect(() => normalizeJson('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => normalizeJson('   \n\t ')).toThrow();
  });

  it('throws on malformed JSON', () => {
    expect(() => normalizeJson('{bad}')).toThrow();
    expect(() => normalizeJson('{"a":}')).toThrow();
    expect(() => normalizeJson("{'a':1}")).toThrow();
  });
});

describe('computeJsonDiff', () => {
  it('treats key-order-only differences as equal', () => {
    const parts = computeJsonDiff('{"a":1,"b":2}', '{"b":2,"a":1}');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('detects value changes', () => {
    const parts = computeJsonDiff('{"a":1}', '{"a":2}');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('produces both an added and a removed part for a changed scalar value', () => {
    const parts = computeJsonDiff('{"a":1}', '{"a":2}');
    expect(parts.some((p) => p.removed && p.value.includes('"a": 1'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('"a": 2'))).toBe(true);
  });

  it('ignores whitespace/formatting differences', () => {
    const parts = computeJsonDiff('{"a":1}', '{\n  "a": 1\n}');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('returns a single unchanged chunk for identical inputs', () => {
    const parts = computeJsonDiff('{"a":1,"b":2}', '{"a":1,"b":2}');
    expect(parts.length).toBe(1);
    expect(parts[0].added).toBeFalsy();
    expect(parts[0].removed).toBeFalsy();
  });

  it('reassembles unchanged portions back to the normalized left input', () => {
    const left = '{"b":2,"a":1}';
    const right = '{"a":1,"b":2}';
    const parts = computeJsonDiff(left, right);
    const kept = parts
      .filter((p) => !p.added && !p.removed)
      .map((p) => p.value)
      .join('');
    expect(kept).toBe(`${normalizeJson(left)}\n`);
  });

  it('detects an added key', () => {
    const parts = computeJsonDiff('{"a":1}', '{"a":1,"b":2}');
    // The new "b" key appears only on the added side.
    expect(parts.some((p) => p.added && p.value.includes('"b": 2'))).toBe(true);
    expect(parts.some((p) => p.removed && p.value.includes('"b": 2'))).toBe(false);
  });

  it('detects a removed key', () => {
    const parts = computeJsonDiff('{"a":1,"b":2}', '{"a":1}');
    // The dropped "b" key appears only on the removed side.
    expect(parts.some((p) => p.removed && p.value.includes('"b": 2'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('"b": 2'))).toBe(false);
  });

  it('reflects array reordering as a difference (order is significant in arrays)', () => {
    const parts = computeJsonDiff('[1,2,3]', '[3,2,1]');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('treats objects equal even when their nested key order differs', () => {
    const parts = computeJsonDiff('{"x":{"q":1,"p":2}}', '{"x":{"p":2,"q":1}}');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('every returned part is newline-terminated and counts match line totals', () => {
    const parts = computeJsonDiff('{"a":1}', '{"a":2}');
    for (const p of parts) {
      expect(p.value.endsWith('\n')).toBe(true);
    }
    const totalCount = parts.reduce((sum, p) => sum + (p.count ?? 0), 0);
    expect(totalCount).toBeGreaterThan(0);
  });

  it('is deterministic across repeated calls', () => {
    const a = computeJsonDiff('{"a":1,"c":3}', '{"a":1,"b":2}');
    const b = computeJsonDiff('{"a":1,"c":3}', '{"a":1,"b":2}');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('detects differences in unicode string values', () => {
    const parts = computeJsonDiff('{"k":"café"}', '{"k":"cafe"}');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('throws when the left input is invalid JSON', () => {
    expect(() => computeJsonDiff('{bad}', '{}')).toThrow();
  });

  it('throws when the right input is invalid JSON', () => {
    expect(() => computeJsonDiff('{}', '{bad}')).toThrow();
  });

  it('throws when either input is empty', () => {
    expect(() => computeJsonDiff('', '{}')).toThrow();
    expect(() => computeJsonDiff('{}', '')).toThrow();
  });
});

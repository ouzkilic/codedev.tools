import { describe, it, expect } from 'vitest';
import { normalizeJson, computeJsonDiff } from './logic';

describe('jsonDiff', () => {
  it('normalizes by sorting keys', () => {
    expect(normalizeJson('{"b":1,"a":2}')).toBe('{\n  "a": 2,\n  "b": 1\n}');
  });
  it('treats key-order-only differences as equal', () => {
    const parts = computeJsonDiff('{"a":1,"b":2}', '{"b":2,"a":1}');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });
  it('detects value changes', () => {
    const parts = computeJsonDiff('{"a":1}', '{"a":2}');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });
  it('ignores whitespace/formatting differences', () => {
    const parts = computeJsonDiff('{"a":1}', '{\n  "a": 1\n}');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });
  it('throws on invalid JSON', () => {
    expect(() => computeJsonDiff('{bad}', '{}')).toThrow();
  });
});

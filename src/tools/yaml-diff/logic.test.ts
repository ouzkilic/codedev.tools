import { describe, it, expect } from 'vitest';
import type { Change } from 'diff';
import { computeYamlDiff, normalizeYaml } from './logic';

const isUnchanged = (parts: Change[]) => parts.every((p) => !p.added && !p.removed);
const hasChange = (parts: Change[]) => parts.some((p) => p.added || p.removed);

describe('normalizeYaml', () => {
  it('re-dumps with sorted keys', () => {
    expect(normalizeYaml('b: 2\na: 1')).toBe('a: 1\nb: 2\n');
  });

  it('sorts nested mapping keys', () => {
    expect(normalizeYaml('z:\n  b: 1\n  a: 2')).toBe('z:\n  a: 2\n  b: 1\n');
  });

  it('is idempotent (re-normalizing yields the same text)', () => {
    const once = normalizeYaml('b: 2\na: 1');
    expect(normalizeYaml(once)).toBe(once);
  });

  it('returns empty string for empty input (yaml.load -> undefined)', () => {
    expect(normalizeYaml('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeYaml('   ')).toBe('');
  });

  it('preserves unicode/emoji scalar content', () => {
    expect(normalizeYaml('msg: "🚀 café"')).toContain('🚀 café');
  });

  it('normalizes scalar numbers without surrounding quotes', () => {
    expect(normalizeYaml('a: 1')).toBe('a: 1\n');
  });

  it('throws on invalid YAML', () => {
    expect(() => normalizeYaml('a:\n - 1\n- 2')).toThrow();
  });
});

describe('computeYamlDiff', () => {
  it('treats key-order-only differences as equal', () => {
    const parts = computeYamlDiff('a: 1\nb: 2', 'b: 2\na: 1');
    expect(isUnchanged(parts)).toBe(true);
  });

  it('treats nested key-order-only differences as equal', () => {
    const parts = computeYamlDiff('z:\n  b: 1\n  a: 2', 'z:\n  a: 2\n  b: 1');
    expect(isUnchanged(parts)).toBe(true);
  });

  it('reports no changes for identical input', () => {
    const parts = computeYamlDiff('a: 1\nb: 2', 'a: 1\nb: 2');
    expect(isUnchanged(parts)).toBe(true);
    expect(parts).toHaveLength(1);
  });

  it('detects value changes', () => {
    const parts = computeYamlDiff('a: 1', 'a: 2');
    expect(hasChange(parts)).toBe(true);
  });

  it('marks an added key as added', () => {
    const parts = computeYamlDiff('a: 1', 'a: 1\nb: 2');
    expect(parts.some((p) => p.added && p.value.includes('b: 2'))).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(false);
  });

  it('marks a removed key as removed', () => {
    const parts = computeYamlDiff('a: 1\nb: 2', 'a: 1');
    expect(parts.some((p) => p.removed && p.value.includes('b: 2'))).toBe(true);
    expect(parts.some((p) => p.added)).toBe(false);
  });

  it('treats list reordering as a real difference (sequences are ordered)', () => {
    const parts = computeYamlDiff('- 1\n- 2', '- 2\n- 1');
    expect(hasChange(parts)).toBe(true);
  });

  it('returns an empty change list when both sides are empty', () => {
    expect(computeYamlDiff('', '')).toEqual([]);
  });

  it('treats whitespace-only vs empty as equal', () => {
    const parts = computeYamlDiff('   ', '');
    expect(isUnchanged(parts)).toBe(true);
  });

  it('shows content added when going from empty to a document', () => {
    const parts = computeYamlDiff('', 'a: 1');
    expect(parts.some((p) => p.added && p.value.includes('a: 1'))).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(false);
  });

  it('detects unicode value changes', () => {
    const parts = computeYamlDiff('name: café', 'name: cafe');
    expect(hasChange(parts)).toBe(true);
  });

  it('handles large inputs and detects a single differing line', () => {
    const left = Array.from({ length: 200 }, (_, i) => `k${i}: ${i}`).join('\n');
    const right = Array.from({ length: 200 }, (_, i) => `k${i}: ${i === 100 ? 'X' : i}`).join('\n');
    const parts = computeYamlDiff(left, right);
    expect(hasChange(parts)).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('X'))).toBe(true);
  });

  it('each change carries a positive line count', () => {
    const parts = computeYamlDiff('a: 1', 'a: 2');
    expect(parts.every((p) => typeof p.count === 'number' && p.count! > 0)).toBe(true);
  });

  it('throws when the left side is invalid YAML', () => {
    expect(() => computeYamlDiff('a:\n - 1\n- 2', 'a: 1')).toThrow();
  });

  it('throws when the right side is invalid YAML', () => {
    expect(() => computeYamlDiff('a: 1', 'a:\n - 1\n- 2')).toThrow();
  });
});

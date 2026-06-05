import { describe, it, expect } from 'vitest';
import { computeYamlDiff } from './logic';

describe('yamlDiff', () => {
  it('treats key-order-only differences as equal', () => {
    const parts = computeYamlDiff('a: 1\nb: 2', 'b: 2\na: 1');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });
  it('detects value changes', () => {
    const parts = computeYamlDiff('a: 1', 'a: 2');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });
  it('throws on invalid YAML', () => {
    expect(() => computeYamlDiff('a:\n - 1\n- 2', 'a: 1')).toThrow();
  });
});

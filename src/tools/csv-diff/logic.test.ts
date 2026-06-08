import { describe, it, expect } from 'vitest';
import { computeCsvDiff } from './logic';

describe('computeCsvDiff', () => {
  it('shows no changes for identical CSV', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n1,2');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('shows changes for differing rows', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n3,4');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });
});

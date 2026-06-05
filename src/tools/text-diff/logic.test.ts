import { describe, it, expect } from 'vitest';
import { computeTextDiff, diffSummary } from './logic';

describe('textDiff', () => {
  it('marks added and removed lines', () => {
    const parts = computeTextDiff('a\nb\n', 'a\nc\n', 'line');
    expect(parts.some((p) => p.removed && p.value.includes('b'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('c'))).toBe(true);
  });
  it('reports no changes for identical input', () => {
    const parts = computeTextDiff('same\ntext', 'same\ntext', 'line');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });
  it('treats case-only differences as equal when ignoreCase is set', () => {
    const parts = computeTextDiff('Hello', 'hello', 'word', { ignoreCase: true });
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });
  it('summarizes added/removed counts', () => {
    const parts = computeTextDiff('a\nb\n', 'a\nc\n', 'line');
    const summary = diffSummary(parts);
    expect(summary.added).toBeGreaterThan(0);
    expect(summary.removed).toBeGreaterThan(0);
  });
});

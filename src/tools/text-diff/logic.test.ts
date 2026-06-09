import { describe, it, expect } from 'vitest';
import { computeTextDiff, diffSummary } from './logic';
import type { Change } from 'diff';

describe('computeTextDiff', () => {
  it('marks added and removed lines in line mode', () => {
    const parts = computeTextDiff('a\nb\n', 'a\nc\n', 'line');
    expect(parts.some((p) => p.removed && p.value.includes('b'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('c'))).toBe(true);
  });

  it('reports no changes for identical input in line mode', () => {
    const parts = computeTextDiff('same\ntext', 'same\ntext', 'line');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('returns a single unchanged part for identical input', () => {
    const parts = computeTextDiff('hello', 'hello', 'line');
    expect(parts).toHaveLength(1);
    expect(parts[0].added).toBeFalsy();
    expect(parts[0].removed).toBeFalsy();
    expect(parts[0].value).toBe('hello');
  });

  it('treats case-only differences as equal when ignoreCase is set (word mode)', () => {
    const parts = computeTextDiff('Hello', 'hello', 'word', { ignoreCase: true });
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('treats case-only differences as equal when ignoreCase is set (char mode)', () => {
    const parts = computeTextDiff('ABC', 'abc', 'char', { ignoreCase: true });
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('reports case differences as changes when ignoreCase is not set (word mode)', () => {
    const parts = computeTextDiff('Hello', 'hello', 'word');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('detects word-level changes in word mode', () => {
    const parts = computeTextDiff('the quick fox', 'the slow fox', 'word');
    expect(parts.some((p) => p.removed && p.value.includes('quick'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('slow'))).toBe(true);
    // shared words remain unchanged
    expect(parts.some((p) => !p.added && !p.removed && p.value.includes('the'))).toBe(true);
  });

  it('detects char-level changes in char mode', () => {
    const parts = computeTextDiff('cat', 'cut', 'char');
    expect(parts.some((p) => p.removed && p.value.includes('a'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('u'))).toBe(true);
  });

  it('ignores leading/trailing whitespace in line mode when ignoreWhitespace is set', () => {
    // diffLines trims each line when ignoreWhitespace is set, so indentation diffs vanish.
    const parts = computeTextDiff('  hello\n', 'hello\n', 'line', { ignoreWhitespace: true });
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('still reports leading whitespace as a change when ignoreWhitespace is not set', () => {
    const parts = computeTextDiff('  hello\n', 'hello\n', 'line');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('treats whitespace differences as changes in line mode by default', () => {
    const parts = computeTextDiff('hello world', 'hello  world', 'line');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('ignores ignoreCase option in line mode (only whitespace honored)', () => {
    // ignoreCase is not passed to diffLines; case differences still register.
    const parts = computeTextDiff('Hello\n', 'hello\n', 'line', { ignoreCase: true });
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('handles two empty strings as no change', () => {
    const parts = computeTextDiff('', '', 'line');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('marks the full right side as added when left is empty', () => {
    const parts = computeTextDiff('', 'brand new', 'char');
    expect(parts.some((p) => p.added && p.value.includes('brand new'))).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(false);
  });

  it('marks the full left side as removed when right is empty', () => {
    const parts = computeTextDiff('gone text', '', 'char');
    expect(parts.some((p) => p.removed && p.value.includes('gone text'))).toBe(true);
    expect(parts.some((p) => p.added)).toBe(false);
  });

  it('uses an empty options object by default without throwing', () => {
    expect(() => computeTextDiff('a', 'b', 'word')).not.toThrow();
    const parts = computeTextDiff('a', 'b', 'word');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('handles unicode and emoji in char mode', () => {
    const parts = computeTextDiff('café 🙂', 'café 🙃', 'char');
    expect(parts.some((p) => p.added)).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(true);
    // the shared "café " prefix should survive as unchanged
    expect(parts.some((p) => !p.added && !p.removed && p.value.includes('café'))).toBe(true);
  });

  it('handles large multi-line input', () => {
    const left = Array.from({ length: 500 }, (_, i) => `line ${i}`).join('\n');
    const right = Array.from({ length: 500 }, (_, i) => (i === 250 ? 'CHANGED' : `line ${i}`)).join(
      '\n',
    );
    const parts = computeTextDiff(left, right, 'line');
    expect(parts.some((p) => p.added && p.value.includes('CHANGED'))).toBe(true);
    expect(parts.some((p) => p.removed && p.value.includes('line 250'))).toBe(true);
  });

  it('reconstructs the original right text from all non-removed parts (round-trip)', () => {
    const left = 'one two three';
    const right = 'one four three';
    const parts = computeTextDiff(left, right, 'word');
    const rebuilt = parts
      .filter((p) => !p.removed)
      .map((p) => p.value)
      .join('');
    expect(rebuilt).toBe(right);
  });

  it('reconstructs the original left text from all non-added parts (round-trip)', () => {
    const left = 'one two three';
    const right = 'one four three';
    const parts = computeTextDiff(left, right, 'word');
    const rebuilt = parts
      .filter((p) => !p.added)
      .map((p) => p.value)
      .join('');
    expect(rebuilt).toBe(left);
  });
});

describe('diffSummary', () => {
  it('summarizes added/removed counts for line diffs', () => {
    const parts = computeTextDiff('a\nb\n', 'a\nc\n', 'line');
    const summary = diffSummary(parts);
    expect(summary.added).toBeGreaterThan(0);
    expect(summary.removed).toBeGreaterThan(0);
  });

  it('returns zero counts for identical input', () => {
    const parts = computeTextDiff('same', 'same', 'line');
    expect(diffSummary(parts)).toEqual({ added: 0, removed: 0 });
  });

  it('returns zero counts for an empty parts array', () => {
    expect(diffSummary([])).toEqual({ added: 0, removed: 0 });
  });

  it('counts only added when right is purely an addition', () => {
    const parts = computeTextDiff('', 'a\nb\nc\n', 'line');
    const summary = diffSummary(parts);
    expect(summary.added).toBeGreaterThan(0);
    expect(summary.removed).toBe(0);
  });

  it('counts only removed when right is empty', () => {
    const parts = computeTextDiff('a\nb\nc\n', '', 'line');
    const summary = diffSummary(parts);
    expect(summary.removed).toBeGreaterThan(0);
    expect(summary.added).toBe(0);
  });

  it('treats a missing count as zero', () => {
    const parts = [
      { added: true, removed: false, value: 'x' },
      { added: false, removed: true, value: 'y' },
    ] as unknown as Change[];
    expect(diffSummary(parts)).toEqual({ added: 0, removed: 0 });
  });

  it('sums explicit counts across multiple change parts', () => {
    const parts: Change[] = [
      { added: true, removed: false, value: 'a', count: 2 },
      { added: false, removed: false, value: 'b', count: 9 },
      { added: false, removed: true, value: 'c', count: 3 },
      { added: true, removed: false, value: 'd', count: 4 },
    ];
    expect(diffSummary(parts)).toEqual({ added: 6, removed: 3 });
  });
});

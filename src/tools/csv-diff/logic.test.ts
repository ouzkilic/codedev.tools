import { describe, it, expect } from 'vitest';
import type { Change } from 'diff';
import { computeCsvDiff } from './logic';

// Helpers derived purely from reasoning about logic.ts:
//   normalize(s) = Papa.unparse(Papa.parse(s.trim(),{skipEmptyLines:true}).data).replace(/\r\n/g,'\n')
//   computeCsvDiff(l,r) = diffLines(normalize(l)+'\n', normalize(r)+'\n')
const added = (parts: Change[]) => parts.filter((p) => p.added);
const removed = (parts: Change[]) => parts.filter((p) => p.removed);
const unchanged = (parts: Change[]) => parts.filter((p) => !p.added && !p.removed);
const reconstruct = (parts: Change[], pick: 'left' | 'right') =>
  parts
    .filter((p) => (pick === 'left' ? !p.added : !p.removed))
    .map((p) => p.value)
    .join('');

describe('computeCsvDiff', () => {
  it('shows no changes for identical CSV', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n1,2');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('shows changes for differing rows', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n3,4');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('returns a single unchanged hunk whose value ends with a trailing newline for identical input', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n1,2');
    expect(parts).toHaveLength(1);
    expect(parts[0].value).toBe('a,b\n1,2\n');
    expect(parts[0].added).toBeFalsy();
    expect(parts[0].removed).toBeFalsy();
  });

  it('treats both empty inputs as a single unchanged newline hunk', () => {
    const parts = computeCsvDiff('', '');
    expect(parts).toHaveLength(1);
    expect(parts[0].value).toBe('\n');
    expect(parts[0].added).toBeFalsy();
    expect(parts[0].removed).toBeFalsy();
  });

  it('normalizes whitespace-only input to the same empty result as truly empty input', () => {
    const fromBlank = computeCsvDiff('   ', '');
    const fromTabs = computeCsvDiff('\t\n  ', '');
    expect(fromBlank).toEqual(fromTabs);
    expect(fromBlank.some((p) => p.added || p.removed)).toBe(false);
    expect(fromBlank.map((p) => p.value).join('')).toBe('\n');
  });

  it('detects a purely added row (right has an extra trailing row)', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n1,2\n3,4');
    expect(added(parts)).toHaveLength(1);
    expect(removed(parts)).toHaveLength(0);
    expect(added(parts)[0].value).toBe('3,4\n');
  });

  it('detects a purely removed row (left has an extra trailing row)', () => {
    const parts = computeCsvDiff('a,b\n1,2\n3,4', 'a,b\n1,2');
    expect(removed(parts)).toHaveLength(1);
    expect(added(parts)).toHaveLength(0);
    expect(removed(parts)[0].value).toBe('3,4\n');
  });

  it('represents a single changed cell as a removed hunk followed by an added hunk', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n1,9');
    expect(removed(parts)).toHaveLength(1);
    expect(added(parts)).toHaveLength(1);
    expect(removed(parts)[0].value).toBe('1,2\n');
    expect(added(parts)[0].value).toBe('1,9\n');
    // header stays unchanged
    expect(unchanged(parts).some((p) => p.value.includes('a,b'))).toBe(true);
  });

  it('ignores a trailing newline difference (normalize strips it)', () => {
    const parts = computeCsvDiff('a,b\n1,2\n', 'a,b\n1,2');
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
    expect(parts.map((p) => p.value).join('')).toBe('a,b\n1,2\n');
  });

  it('ignores leading whitespace difference (input is trimmed)', () => {
    const parts = computeCsvDiff('   \na,b\n1,2', 'a,b\n1,2');
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
  });

  it('treats CRLF and LF line endings as equal after normalization', () => {
    const parts = computeCsvDiff('a,b\r\n1,2\r\n3,4', 'a,b\n1,2\n3,4');
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
    // No \r should survive normalization.
    expect(parts.map((p) => p.value).join('')).not.toContain('\r');
  });

  it('drops interior blank lines so they do not register as differences', () => {
    const parts = computeCsvDiff('a,b\n\n\n1,2', 'a,b\n1,2');
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
  });

  it('preserves quoting for fields containing the delimiter', () => {
    const parts = computeCsvDiff('a,b\n"x,y",2', 'a,b\n"x,y",2');
    const all = parts.map((p) => p.value).join('');
    expect(all).toContain('"x,y"');
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
  });

  it('preserves quoting for fields containing embedded newlines', () => {
    const left = 'a\n"x\ny"';
    const parts = computeCsvDiff(left, left);
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
    expect(parts.map((p) => p.value).join('')).toContain('"x\ny"');
  });

  it('handles unicode / accented characters as a real difference', () => {
    const parts = computeCsvDiff('n\ncafé', 'n\ncafe');
    expect(removed(parts).map((p) => p.value).join('')).toContain('café');
    expect(added(parts).map((p) => p.value).join('')).toContain('cafe');
  });

  it('treats identical emoji content as unchanged and keeps the emoji intact', () => {
    const parts = computeCsvDiff('name\n😀🎉', 'name\n😀🎉');
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
    expect(parts.map((p) => p.value).join('')).toContain('😀🎉');
  });

  it('detects an emoji change between two rows', () => {
    const parts = computeCsvDiff('name\n😀', 'name\n😎');
    expect(removed(parts).map((p) => p.value).join('')).toContain('😀');
    expect(added(parts).map((p) => p.value).join('')).toContain('😎');
  });

  it('detects reordered rows as a deletion plus a re-insertion', () => {
    const parts = computeCsvDiff('a\n1\n2', 'a\n2\n1');
    expect(added(parts).length).toBeGreaterThanOrEqual(1);
    expect(removed(parts).length).toBeGreaterThanOrEqual(1);
  });

  it('keeps numeric boundary values (zero, negative, decimal) verbatim', () => {
    const src = 'n\n0\n-5\n3.14';
    const parts = computeCsvDiff(src, src);
    expect(parts.some((p) => p.added || p.removed)).toBe(false);
    const all = parts.map((p) => p.value).join('');
    expect(all).toContain('0\n');
    expect(all).toContain('-5\n');
    expect(all).toContain('3.14\n');
  });

  it('left-side reconstruction (drop additions) equals normalized left input', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n9,9\n7,7');
    expect(reconstruct(parts, 'left')).toBe('a,b\n1,2\n');
  });

  it('right-side reconstruction (drop removals) equals normalized right input', () => {
    const parts = computeCsvDiff('a,b\n1,2', 'a,b\n9,9\n7,7');
    expect(reconstruct(parts, 'right')).toBe('a,b\n9,9\n7,7\n');
  });

  it('is deterministic for the same inputs', () => {
    const a = computeCsvDiff('a,b\n1,2\n3,4', 'a,b\n1,9\n3,4');
    const b = computeCsvDiff('a,b\n1,2\n3,4', 'a,b\n1,9\n3,4');
    expect(a).toEqual(b);
  });

  it('handles a large input without losing the changed row', () => {
    const rows = Array.from({ length: 2000 }, (_, i) => `${i},val${i}`);
    const left = 'id,val\n' + rows.join('\n');
    const changed = [...rows];
    changed[1500] = '1500,CHANGED';
    const right = 'id,val\n' + changed.join('\n');
    const parts = computeCsvDiff(left, right);
    expect(removed(parts).map((p) => p.value).join('')).toContain('1500,val1500');
    expect(added(parts).map((p) => p.value).join('')).toContain('1500,CHANGED');
  });

  it('every change hunk has a positive line count', () => {
    const parts = computeCsvDiff('a,b\n1,2\n3,4', 'a,b\n1,9');
    for (const p of parts) {
      expect(p.count).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { generateNanoids, NANOID_OPTIONS } from './logic';

const URL_SAFE = /^[A-Za-z0-9_-]+$/;

function lines(out: string): string[] {
  return out.split('\n');
}

describe('nanoid', () => {
  // --- Happy paths ---
  it('generates the requested count and length', () => {
    const ids = lines(generateNanoids({ length: '10', count: '4' }));
    expect(ids).toHaveLength(4);
    expect(ids.every((id) => id.length === 10)).toBe(true);
  });

  it('only uses URL-safe characters', () => {
    const ids = lines(generateNanoids({ length: '32', count: '5' }));
    expect(ids.every((id) => URL_SAFE.test(id))).toBe(true);
  });

  it('produces unique values', () => {
    const ids = lines(generateNanoids({ length: '21', count: '50' }));
    expect(new Set(ids).size).toBe(50);
  });

  it('joins multiple ids with a single newline', () => {
    const out = generateNanoids({ length: '5', count: '3' });
    // 3 ids of length 5 + 2 separators = 17 chars, no trailing newline
    expect(out.length).toBe(3 * 5 + 2);
    expect(out.endsWith('\n')).toBe(false);
    expect(out.startsWith('\n')).toBe(false);
  });

  it('a single id contains no newline', () => {
    const out = generateNanoids({ length: '21', count: '1' });
    expect(out.includes('\n')).toBe(false);
    expect(out.length).toBe(21);
  });

  // --- Defaults / fallbacks ---
  it('falls back to defaults for invalid input', () => {
    const ids = lines(generateNanoids({ length: 'x', count: 'y' }));
    expect(ids).toHaveLength(1);
    expect(ids[0].length).toBe(21);
  });

  it('uses default length 21 and count 1 when options are empty', () => {
    const ids = lines(generateNanoids({}));
    expect(ids).toHaveLength(1);
    expect(ids[0].length).toBe(21);
  });

  it('uses default length when only count provided', () => {
    const ids = lines(generateNanoids({ count: '3' }));
    expect(ids).toHaveLength(3);
    expect(ids.every((id) => id.length === 21)).toBe(true);
  });

  it('uses default count when only length provided', () => {
    const ids = lines(generateNanoids({ length: '8' }));
    expect(ids).toHaveLength(1);
    expect(ids[0].length).toBe(8);
  });

  // --- Boundary clamping: length ---
  it('clamps length below 1 up to 1 (zero)', () => {
    const ids = lines(generateNanoids({ length: '0', count: '2' }));
    expect(ids.every((id) => id.length === 1)).toBe(true);
  });

  it('clamps negative length up to 1', () => {
    const ids = lines(generateNanoids({ length: '-5', count: '1' }));
    expect(ids[0].length).toBe(1);
  });

  it('clamps length above 512 down to 512', () => {
    const ids = lines(generateNanoids({ length: '99999', count: '1' }));
    expect(ids[0].length).toBe(512);
  });

  it('allows exact max length 512', () => {
    const ids = lines(generateNanoids({ length: '512', count: '1' }));
    expect(ids[0].length).toBe(512);
  });

  it('allows minimum length 1', () => {
    const ids = lines(generateNanoids({ length: '1', count: '3' }));
    expect(ids.every((id) => id.length === 1)).toBe(true);
  });

  // --- Boundary clamping: count ---
  it('clamps count below 1 up to 1 (zero)', () => {
    const ids = lines(generateNanoids({ length: '4', count: '0' }));
    expect(ids).toHaveLength(1);
  });

  it('clamps negative count up to 1', () => {
    const ids = lines(generateNanoids({ length: '4', count: '-10' }));
    expect(ids).toHaveLength(1);
  });

  it('clamps count above 1000 down to 1000', () => {
    const ids = lines(generateNanoids({ length: '4', count: '5000' }));
    expect(ids).toHaveLength(1000);
  });

  it('allows exact max count 1000', () => {
    const ids = lines(generateNanoids({ length: '2', count: '1000' }));
    expect(ids).toHaveLength(1000);
  });

  // --- parseInt parsing quirks ---
  it('truncates decimal length via parseInt', () => {
    const ids = lines(generateNanoids({ length: '10.9', count: '1' }));
    expect(ids[0].length).toBe(10);
  });

  it('parses leading/trailing whitespace in numeric strings', () => {
    const ids = lines(generateNanoids({ length: '  7  ', count: ' 2 ' }));
    expect(ids).toHaveLength(2);
    expect(ids.every((id) => id.length === 7)).toBe(true);
  });

  it('parses trailing non-numeric suffix (parseInt stops at first non-digit)', () => {
    const ids = lines(generateNanoids({ length: '12abc', count: '3xyz' }));
    expect(ids).toHaveLength(3);
    expect(ids.every((id) => id.length === 12)).toBe(true);
  });

  it('falls back when string starts with non-numeric char', () => {
    const ids = lines(generateNanoids({ length: 'a12', count: 'b3' }));
    expect(ids).toHaveLength(1); // count fallback 1
    expect(ids[0].length).toBe(21); // length fallback 21
  });

  // --- Non-string (boolean) option values ---
  it('falls back to defaults for boolean option values', () => {
    const ids = lines(generateNanoids({ length: true, count: false } as ToolOptions));
    expect(ids).toHaveLength(1); // String(false)='false' -> NaN -> 1
    expect(ids[0].length).toBe(21); // String(true)='true' -> NaN -> 21
  });

  it('parses empty string as fallback', () => {
    const ids = lines(generateNanoids({ length: '', count: '' }));
    expect(ids).toHaveLength(1);
    expect(ids[0].length).toBe(21);
  });

  it('parses whitespace-only string as fallback', () => {
    const ids = lines(generateNanoids({ length: '   ', count: '   ' }));
    expect(ids).toHaveLength(1);
    expect(ids[0].length).toBe(21);
  });

  // --- Determinism of structure (not values) ---
  it('produces unique values across a large batch', () => {
    const ids = lines(generateNanoids({ length: '21', count: '1000' }));
    expect(ids).toHaveLength(1000);
    expect(new Set(ids).size).toBe(1000);
    expect(ids.every((id) => URL_SAFE.test(id) && id.length === 21)).toBe(true);
  });

  // --- NANOID_OPTIONS metadata ---
  it('exposes length and count options with correct defaults', () => {
    const length = NANOID_OPTIONS.find((o) => o.key === 'length');
    const count = NANOID_OPTIONS.find((o) => o.key === 'count');
    expect(length?.default).toBe('21');
    expect(count?.default).toBe('5');
    expect(length?.type).toBe('text');
    expect(count?.type).toBe('text');
  });
});

import { describe, expect, it } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { buildPalette, PALETTE_OPTIONS } from './logic';

const HEX_LINE = /^#[0-9a-f]{6}$/;

function linesOf(opts: ToolOptions): string[] {
  return buildPalette(opts).split('\n');
}

describe('PALETTE_OPTIONS', () => {
  it('exposes a single text "count" option with default "5"', () => {
    expect(PALETTE_OPTIONS).toHaveLength(1);
    const [count] = PALETTE_OPTIONS;
    expect(count.key).toBe('count');
    expect(count.type).toBe('text');
    expect(count.default).toBe('5');
  });
});

describe('buildPalette - happy path', () => {
  it('returns the requested number of valid hex colors', () => {
    const lines = linesOf({ count: '5' });
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(HEX_LINE);
    }
  });

  it('every line is a lowercase 6-digit hex prefixed with #', () => {
    const out = buildPalette({ count: '12' });
    expect(out).toMatch(/^(#[0-9a-f]{6}\n){11}#[0-9a-f]{6}$/);
  });

  it('joins colors with a single newline and produces no trailing newline', () => {
    const out = buildPalette({ count: '3' });
    expect(out.split('\n')).toHaveLength(3);
    expect(out.endsWith('\n')).toBe(false);
  });
});

describe('buildPalette - count parsing', () => {
  it('uses default of 5 when count is undefined', () => {
    expect(linesOf({})).toHaveLength(5);
  });

  it('parses a normal integer string', () => {
    expect(linesOf({ count: '7' })).toHaveLength(7);
  });

  it('truncates a decimal string via parseInt', () => {
    // parseInt('7.9', 10) === 7
    expect(linesOf({ count: '7.9' })).toHaveLength(7);
  });

  it('parses leading numeric part of a mixed string', () => {
    // parseInt('12abc', 10) === 12
    expect(linesOf({ count: '12abc' })).toHaveLength(12);
  });

  it('respects leading whitespace (parseInt trims)', () => {
    expect(linesOf({ count: '  9 ' })).toHaveLength(9);
  });

  it('falls back to 5 for a fully non-numeric string', () => {
    // parseInt('abc', 10) === NaN -> 5
    expect(linesOf({ count: 'abc' })).toHaveLength(5);
  });

  it('falls back to 5 for empty string', () => {
    expect(linesOf({ count: '' })).toHaveLength(5);
  });

  it('falls back to 5 for whitespace-only string', () => {
    expect(linesOf({ count: '   ' })).toHaveLength(5);
  });

  it('falls back to 5 for unicode / emoji input', () => {
    expect(linesOf({ count: '🎨' })).toHaveLength(5);
  });

  it('falls back to 5 when count is a boolean true (String(true) -> "true")', () => {
    expect(linesOf({ count: true })).toHaveLength(5);
  });

  it('falls back to 5 when count is a boolean false (String(false) -> "false")', () => {
    expect(linesOf({ count: false })).toHaveLength(5);
  });
});

describe('buildPalette - clamping', () => {
  it('clamps 0 up to the minimum of 1', () => {
    expect(linesOf({ count: '0' })).toHaveLength(1);
  });

  it('clamps negative values up to 1', () => {
    expect(linesOf({ count: '-3' })).toHaveLength(1);
  });

  it('accepts the lower boundary value 1', () => {
    expect(linesOf({ count: '1' })).toHaveLength(1);
  });

  it('accepts the upper boundary value 50', () => {
    expect(linesOf({ count: '50' })).toHaveLength(50);
  });

  it('clamps values above 50 down to 50', () => {
    expect(linesOf({ count: '100' })).toHaveLength(50);
  });

  it('clamps very large input down to 50', () => {
    expect(linesOf({ count: '999999999' })).toHaveLength(50);
    for (const line of linesOf({ count: '999999999' })) {
      expect(line).toMatch(HEX_LINE);
    }
  });
});

describe('buildPalette - structure invariants', () => {
  it('produces 6-digit hex even for the minimum value (zero-padding holds)', () => {
    const [only] = linesOf({ count: '1' });
    expect(only).toMatch(HEX_LINE);
    expect(only).toHaveLength(7); // '#' + 6 digits
  });

  it('never emits a color outside the 0x000000..0xffffff range', () => {
    for (const line of linesOf({ count: '50' })) {
      const value = parseInt(line.slice(1), 16);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0xffffff);
    }
  });

  it('count of output lines is deterministic across calls for the same option', () => {
    expect(linesOf({ count: '8' }).length).toBe(linesOf({ count: '8' }).length);
  });
});

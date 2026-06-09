import { describe, it, expect } from 'vitest';
import { buildBezier, BEZIER_OPTIONS } from './logic';

describe('BEZIER_OPTIONS', () => {
  it('exposes four text options with expected keys and defaults', () => {
    expect(BEZIER_OPTIONS).toHaveLength(4);
    expect(BEZIER_OPTIONS.map((o) => o.key)).toEqual(['x1', 'y1', 'x2', 'y2']);
    expect(BEZIER_OPTIONS.every((o) => o.type === 'text')).toBe(true);
    expect(BEZIER_OPTIONS.map((o) => o.default)).toEqual(['0.25', '0.1', '0.25', '1']);
  });

  it('default values produce the documented default curve', () => {
    const opts = Object.fromEntries(
      BEZIER_OPTIONS.map((o) => [o.key, o.default as string]),
    );
    expect(buildBezier(opts)).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });
});

describe('buildBezier', () => {
  it('returns defaults for empty options object', () => {
    expect(buildBezier({})).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });

  it('uses fully custom numeric values (linear)', () => {
    expect(buildBezier({ x1: '0', y1: '0', x2: '1', y2: '1' })).toBe(
      'transition-timing-function: cubic-bezier(0, 0, 1, 1);',
    );
  });

  it('falls back per-field on NaN and empty string', () => {
    expect(buildBezier({ x1: 'foo', y1: 'bar', x2: '', y2: 'baz' })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });

  it('falls back only for the invalid field, keeping valid neighbors', () => {
    // x1 invalid -> 0.25, y1 valid 0.42, x2 invalid -> 0.25, y2 valid 0.58
    expect(buildBezier({ x1: 'abc', y1: '0.42', x2: '???', y2: '0.58' })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.42, 0.25, 0.58);',
    );
  });

  it('handles negative values (overshoot curves)', () => {
    expect(buildBezier({ x1: '-0.5', y1: '-0.25', x2: '1.5', y2: '1.25' })).toBe(
      'transition-timing-function: cubic-bezier(-0.5, -0.25, 1.5, 1.25);',
    );
  });

  it('keeps integer zeros without decimals', () => {
    expect(buildBezier({ x1: '0', y1: '0', x2: '0', y2: '0' })).toBe(
      'transition-timing-function: cubic-bezier(0, 0, 0, 0);',
    );
  });

  it('parses leading-decimal notation like .5', () => {
    expect(buildBezier({ x1: '.5', y1: '.25', x2: '.75', y2: '.1' })).toBe(
      'transition-timing-function: cubic-bezier(0.5, 0.25, 0.75, 0.1);',
    );
  });

  it('parses scientific notation', () => {
    // parseFloat('1e-1') === 0.1, parseFloat('2e0') === 2
    expect(buildBezier({ x1: '1e-1', y1: '2e0', x2: '5e-1', y2: '1.5e0' })).toBe(
      'transition-timing-function: cubic-bezier(0.1, 2, 0.5, 1.5);',
    );
  });

  it('parses leading whitespace and trailing garbage via parseFloat semantics', () => {
    // parseFloat('  0.3 ') === 0.3 ; parseFloat('0.5abc') === 0.5
    expect(buildBezier({ x1: '  0.3', y1: '0.5abc', x2: '0.7px', y2: '0.9 ' })).toBe(
      'transition-timing-function: cubic-bezier(0.3, 0.5, 0.7, 0.9);',
    );
  });

  it('treats a string that does not start with a number as NaN -> fallback', () => {
    // parseFloat('px0.5') === NaN
    expect(buildBezier({ x1: 'px0.5', y1: '0.2', x2: '0.3', y2: '0.4' })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.2, 0.3, 0.4);',
    );
  });

  it('treats boolean option values as NaN -> fallback', () => {
    // String(true) -> 'true' -> parseFloat NaN ; String(false) -> 'false' -> NaN
    expect(buildBezier({ x1: true, y1: false, x2: true, y2: false })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });

  it('treats whitespace-only values as NaN -> fallback', () => {
    expect(buildBezier({ x1: '   ', y1: '\t', x2: '\n', y2: '  ' })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });

  it('handles unicode / emoji input as NaN -> fallback', () => {
    expect(buildBezier({ x1: '🚀', y1: 'ünïcode', x2: '日本', y2: '✨0.5' })).toBe(
      'transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);',
    );
  });

  it('keeps explicit +0 / -0 normalized to 0 via join', () => {
    // parseFloat('-0') === -0, but String(-0) -> '0'
    expect(buildBezier({ x1: '-0', y1: '+0', x2: '0.0', y2: '0' })).toBe(
      'transition-timing-function: cubic-bezier(0, 0, 0, 0);',
    );
  });

  it('renders Infinity from "Infinity" string (parseFloat semantics)', () => {
    // parseFloat('Infinity') === Infinity, joins as 'Infinity'
    expect(buildBezier({ x1: 'Infinity', y1: '-Infinity', x2: '0.5', y2: '0.5' })).toBe(
      'transition-timing-function: cubic-bezier(Infinity, -Infinity, 0.5, 0.5);',
    );
  });

  it('handles very large and very small magnitudes', () => {
    expect(buildBezier({ x1: '1000000', y1: '0.000001', x2: '999999.5', y2: '-1000000' })).toBe(
      'transition-timing-function: cubic-bezier(1000000, 0.000001, 999999.5, -1000000);',
    );
  });

  it('ignores extra unknown option keys', () => {
    expect(
      buildBezier({ x1: '0.1', y1: '0.2', x2: '0.3', y2: '0.4', extra: 'nope', flag: true }),
    ).toBe('transition-timing-function: cubic-bezier(0.1, 0.2, 0.3, 0.4);');
  });

  it('is deterministic for the same input', () => {
    const input = { x1: '0.17', y1: '0.67', x2: '0.83', y2: '0.67' };
    const a = buildBezier(input);
    const b = buildBezier(input);
    expect(a).toBe(b);
    expect(a).toBe('transition-timing-function: cubic-bezier(0.17, 0.67, 0.83, 0.67);');
  });

  it('always returns a well-formed CSS declaration', () => {
    const out = buildBezier({ x1: '0.42', y1: '0', x2: '0.58', y2: '1' });
    expect(out).toMatch(
      /^transition-timing-function: cubic-bezier\([^,]+, [^,]+, [^,]+, [^,]+\);$/,
    );
  });
});

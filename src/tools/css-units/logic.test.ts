import { describe, it, expect } from 'vitest';
import { cssUnitsLogic } from './logic';

const conv = (s: string, base = '16') =>
  cssUnitsLogic.transform(s, { options: { base }, secondary: '' });

describe('cssUnits', () => {
  it('converts px to rem at the default base', () => {
    const out = conv('16px');
    expect(out).toContain('px:   16px');
    expect(out).toContain('rem:  1rem');
  });

  it('converts rem to px', () => {
    expect(conv('2rem')).toContain('px:   32px');
  });

  it('respects a custom root font size', () => {
    expect(conv('20px', '10')).toContain('rem:  2rem');
  });

  it('assumes px when no unit is given', () => {
    expect(conv('24')).toContain('rem:  1.5rem');
  });

  it('throws on invalid input', () => {
    expect(() => conv('abc')).toThrow();
  });

  it('produces all three labelled lines', () => {
    const out = conv('16px');
    const lines = out.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^px:\s+/);
    expect(lines[1]).toMatch(/^rem:\s+/);
    expect(lines[2]).toMatch(/^em:\s+/);
  });

  it('returns identical rem and em values (both derived from px/base)', () => {
    // The logic computes rem and em both as px / base, so they always match.
    const out = conv('40px', '16');
    expect(out).toContain('rem:  2.5rem');
    expect(out).toContain('em:   2.5em');
  });

  it('converts em to px using the base', () => {
    // value * base = 3 * 16 = 48px
    const out = conv('3em', '16');
    expect(out).toContain('px:   48px');
    expect(out).toContain('rem:  3rem');
    expect(out).toContain('em:   3em');
  });

  it('keeps px input as the same px output', () => {
    expect(conv('64px')).toContain('px:   64px');
  });

  it('handles a decimal px value', () => {
    // 1.5px -> rem 1.5/16 = 0.09375
    const out = conv('1.5px');
    expect(out).toContain('px:   1.5px');
    expect(out).toContain('rem:  0.0938rem'); // 0.09375 rounded to 4 dp -> 0.0938
  });

  it('handles a leading-dot decimal value', () => {
    // .5rem -> px = 0.5 * 16 = 8
    const out = conv('.5rem');
    expect(out).toContain('px:   8px');
    expect(out).toContain('rem:  0.5rem');
  });

  it('handles negative values', () => {
    const out = conv('-2rem', '16');
    expect(out).toContain('px:   -32px');
    expect(out).toContain('rem:  -2rem');
    expect(out).toContain('em:   -2em');
  });

  it('handles zero', () => {
    const out = conv('0px');
    expect(out).toContain('px:   0px');
    expect(out).toContain('rem:  0rem');
    expect(out).toContain('em:   0em');
  });

  it('trims surrounding whitespace before matching', () => {
    expect(conv('   12px   ')).toContain('px:   12px');
  });

  it('allows whitespace between number and unit', () => {
    // regex: (number)\s*(unit) so "8 px" is valid
    const out = conv('8 px');
    expect(out).toContain('px:   8px');
  });

  it('is case-insensitive for units', () => {
    expect(conv('2REM')).toContain('px:   32px');
    expect(conv('10PX')).toContain('rem:  0.625rem');
  });

  it('falls back to base 16 when base option is empty', () => {
    // parseFloat('') is NaN -> || 16
    expect(conv('2rem', '')).toContain('px:   32px');
  });

  it('falls back to base 16 when base option is zero', () => {
    // parseFloat('0') is 0 (falsy) -> || 16
    expect(conv('1rem', '0')).toContain('px:   16px');
  });

  it('falls back to base 16 when base option is non-numeric', () => {
    expect(conv('1rem', 'xyz')).toContain('px:   16px');
  });

  it('uses base 16 when ctx is omitted entirely', () => {
    const out = cssUnitsLogic.transform('2rem');
    expect(out).toContain('px:   32px');
  });

  it('parses a fractional base value', () => {
    // base 12.5; 25px -> rem = 25/12.5 = 2
    expect(conv('25px', '12.5')).toContain('rem:  2rem');
  });

  it('rounds to at most 4 decimal places and strips trailing zeros', () => {
    // 1px at base 3 -> rem = 0.3333... -> 0.3333
    const out = conv('1px', '3');
    expect(out).toContain('rem:  0.3333rem');
  });

  it('throws on the empty string', () => {
    expect(() => conv('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => conv('   ')).toThrow();
  });

  it('throws on an unsupported unit', () => {
    expect(() => conv('10pt')).toThrow('Enter a value like');
  });

  it('throws on a trailing dot with no fraction digits', () => {
    // regex requires \d+ after optional dot, so "5." fails
    expect(() => conv('5.')).toThrow();
  });

  it('throws on extra trailing characters', () => {
    expect(() => conv('16px extra')).toThrow();
  });

  it('throws when given an emoji / unicode', () => {
    expect(() => conv('🚀rem')).toThrow();
  });

  it('handles a very large input value', () => {
    const out = conv('1000000px');
    expect(out).toContain('px:   1000000px');
    expect(out).toContain('rem:  62500rem');
  });

  it('round-trips px -> rem -> px', () => {
    // 32px -> 2rem; feeding 2rem back yields 32px
    const remOut = conv('32px');
    expect(remOut).toContain('rem:  2rem');
    expect(conv('2rem')).toContain('px:   32px');
  });

  it('is deterministic for repeated calls', () => {
    expect(conv('48px')).toBe(conv('48px'));
  });

  it('exposes a base option definition', () => {
    expect(cssUnitsLogic.options).toBeDefined();
    expect(cssUnitsLogic.options?.[0]?.key).toBe('base');
  });
});

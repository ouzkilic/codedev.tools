import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { contrastRatio, contrastLogic } from './logic';

const ctx = (secondary: string): ToolContext => ({ options: {}, secondary });

describe('contrastRatio', () => {
  it('computes 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('computes 1:1 for identical colors', () => {
    expect(contrastRatio('#777', '#777')).toBeCloseTo(1, 5);
  });

  it('is order-independent (fg/bg swap yields same ratio)', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(contrastRatio('#fff', '#000'), 5);
  });

  it('expands 3-digit hex equivalently to 6-digit', () => {
    expect(contrastRatio('#abc', '#000')).toBeCloseTo(contrastRatio('#aabbcc', '#000'), 10);
  });

  it('parses rgb() functional notation', () => {
    expect(contrastRatio('rgb(0,0,0)', 'rgb(255,255,255)')).toBeCloseTo(21, 5);
  });

  it('parses rgba() and ignores the alpha channel', () => {
    expect(contrastRatio('rgba(0,0,0,0.5)', '#fff')).toBeCloseTo(21, 5);
  });

  it('rgb() with surrounding whitespace inside parens', () => {
    expect(contrastRatio('rgb( 0 , 0 , 0 )', '#fff')).toBeCloseTo(21, 5);
  });

  it('is case-insensitive for hex', () => {
    expect(contrastRatio('#ABCDEF', '#000')).toBeCloseTo(contrastRatio('#abcdef', '#000'), 10);
  });

  it('accepts bare hex without leading #', () => {
    expect(contrastRatio('000000', 'ffffff')).toBeCloseTo(21, 5);
  });

  it('trims leading/trailing whitespace around the color', () => {
    expect(contrastRatio('  #000  ', '  #fff  ')).toBeCloseTo(21, 5);
  });

  it('computes a known mid-gray vs white ratio (~3.95)', () => {
    expect(contrastRatio('#808080', '#ffffff')).toBeCloseTo(3.9494396, 5);
  });

  it('computes pure red vs white (~4.0)', () => {
    expect(contrastRatio('#ff0000', '#ffffff')).toBeCloseTo(3.9984767, 5);
  });

  it('clamps nothing: rgb values above 255 still compute a (high) ratio', () => {
    // rgb(300,...) is treated literally; channel f() grows past 1, producing ratio > 21.
    expect(contrastRatio('rgb(300,300,300)', '#000')).toBeGreaterThan(21);
  });

  it('always returns a ratio >= 1', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeGreaterThanOrEqual(1);
    expect(contrastRatio('#abcdef', '#123456')).toBeGreaterThanOrEqual(1);
  });

  it('is deterministic across repeated calls', () => {
    const a = contrastRatio('#3366cc', '#fefefe');
    const b = contrastRatio('#3366cc', '#fefefe');
    expect(a).toBe(b);
  });

  it('throws on a non-color word', () => {
    expect(() => contrastRatio('nope', '#fff')).toThrow(/Invalid color: nope/);
  });

  it('throws on empty foreground', () => {
    expect(() => contrastRatio('', '#fff')).toThrow(/Invalid color/);
  });

  it('throws on whitespace-only foreground', () => {
    expect(() => contrastRatio('   ', '#fff')).toThrow(/Invalid color/);
  });

  it('throws on too-short hex (#12)', () => {
    expect(() => contrastRatio('#12', '#fff')).toThrow(/Invalid color/);
  });

  it('throws on 4-digit hex (#1234)', () => {
    expect(() => contrastRatio('#1234', '#fff')).toThrow(/Invalid color/);
  });

  it('throws on out-of-range hex chars (ggg)', () => {
    expect(() => contrastRatio('ggg', '#fff')).toThrow(/Invalid color/);
  });

  it('throws when rgb() is missing its third channel', () => {
    expect(() => contrastRatio('rgb(0,0)', '#fff')).toThrow(/Invalid color/);
  });

  it('throws when the background is invalid even if foreground is valid', () => {
    expect(() => contrastRatio('#000', 'not-a-color')).toThrow(/Invalid color/);
  });
});

describe('contrastLogic.transform', () => {
  it('reports 21:1 and AA pass for black on white', () => {
    const out = contrastLogic.transform('#000', ctx('#fff'));
    expect(out).toContain('Contrast ratio: 21:1');
    expect(out).toMatch(/AA.*Pass/);
  });

  it('emits all four conformance lines', () => {
    const out = contrastLogic.transform('#000', ctx('#fff'));
    expect(out).toContain('AA  (normal text, ≥ 4.5):');
    expect(out).toContain('AA  (large text,  ≥ 3.0):');
    expect(out).toContain('AAA (normal text, ≥ 7.0):');
    expect(out).toContain('AAA (large text,  ≥ 4.5):');
  });

  it('rounds the ratio to two decimals', () => {
    // #777 vs #fff -> 4.4836... rounds to 4.48
    const out = contrastLogic.transform('#777', ctx('#fff'));
    expect(out).toContain('Contrast ratio: 4.48:1');
  });

  it('fails everything for identical colors (ratio 1)', () => {
    const out = contrastLogic.transform('#777', ctx('#777'));
    expect(out).toContain('Contrast ratio: 1:1');
    expect(out).not.toContain('Pass');
    expect((out.match(/Fail/g) ?? []).length).toBe(4);
  });

  it('red on white passes large-text (3.0) but fails normal (4.5)', () => {
    // ratio ~3.998 -> AA large (3.0) pass; AA normal (4.5) fail; AAA both fail
    const out = contrastLogic.transform('#ff0000', ctx('#ffffff'));
    expect(out).toMatch(/AA {2}\(large text, {2}≥ 3\.0\): ✓ Pass/);
    expect(out).toMatch(/AA {2}\(normal text, ≥ 4\.5\): ✗ Fail/);
    expect(out).toMatch(/AAA \(normal text, ≥ 7\.0\): ✗ Fail/);
  });

  it('mid-gray (~3.95) fails AA normal but passes AA large', () => {
    const out = contrastLogic.transform('#808080', ctx('#ffffff'));
    expect(out).toMatch(/AA {2}\(large text, {2}≥ 3\.0\): ✓ Pass/);
    expect(out).toMatch(/AA {2}\(normal text, ≥ 4\.5\): ✗ Fail/);
  });

  it('uses Pass marker ✓ and Fail marker ✗', () => {
    const out = contrastLogic.transform('#000', ctx('#fff'));
    expect(out).toContain('✓ Pass');
    expect(out).not.toContain('✗ Fail');
  });

  it('returns exactly six lines (ratio, blank, four checks)', () => {
    const out = contrastLogic.transform('#000', ctx('#fff'));
    const lines = out.split('\n');
    expect(lines).toHaveLength(6);
    expect(lines[1]).toBe('');
  });

  it('exposes a secondary editor definition for the background', () => {
    expect(contrastLogic.secondary).toEqual({
      label: 'Background color',
      placeholder: '#ffffff',
    });
  });

  it('propagates parse errors from an invalid foreground', () => {
    expect(() => contrastLogic.transform('garbage', ctx('#fff'))).toThrow(/Invalid color/);
  });

  it('throws when secondary (background) is empty', () => {
    expect(() => contrastLogic.transform('#000', ctx(''))).toThrow(/Invalid color/);
  });

  it('throws when ctx is omitted entirely (no background)', () => {
    expect(() => contrastLogic.transform('#000')).toThrow(/Invalid color/);
  });
});

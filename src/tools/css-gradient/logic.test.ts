import { describe, it, expect } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { buildGradient, gradientCss, GRADIENT_OPTIONS } from './logic';

describe('cssGradient buildGradient', () => {
  it('builds a linear gradient', () => {
    expect(buildGradient({ type: 'linear', angle: '90deg', from: '#f00', to: '#00f' }))
      .toBe('linear-gradient(90deg, #f00, #00f)');
  });

  it('builds a radial gradient', () => {
    expect(buildGradient({ type: 'radial', angle: 'circle', from: '#fff', to: '#000' }))
      .toBe('radial-gradient(circle, #fff, #000)');
  });

  it('uses all defaults when given an empty options object', () => {
    expect(buildGradient({}))
      .toBe('linear-gradient(90deg, #ff6a00, #ee0979)');
  });

  it('defaults angle to 90deg for linear when angle is empty string', () => {
    expect(buildGradient({ type: 'linear', angle: '', from: '#f00', to: '#00f' }))
      .toBe('linear-gradient(90deg, #f00, #00f)');
  });

  it('defaults angle to circle for radial when angle is empty string', () => {
    expect(buildGradient({ type: 'radial', angle: '', from: '#fff', to: '#000' }))
      .toBe('radial-gradient(circle, #fff, #000)');
  });

  it('treats whitespace-only angle as empty after trim (linear -> 90deg)', () => {
    expect(buildGradient({ type: 'linear', angle: '   ', from: '#f00', to: '#00f' }))
      .toBe('linear-gradient(90deg, #f00, #00f)');
  });

  it('treats whitespace-only angle as empty after trim (radial -> circle)', () => {
    expect(buildGradient({ type: 'radial', angle: '\t\n ', from: '#fff', to: '#000' }))
      .toBe('radial-gradient(circle, #fff, #000)');
  });

  it('trims leading/trailing whitespace from angle', () => {
    expect(buildGradient({ type: 'linear', angle: '  45deg  ', from: '#f00', to: '#00f' }))
      .toBe('linear-gradient(45deg, #f00, #00f)');
  });

  it('trims leading/trailing whitespace from from and to colors', () => {
    expect(buildGradient({ type: 'linear', angle: '90deg', from: '  red ', to: '  blue ' }))
      .toBe('linear-gradient(90deg, red, blue)');
  });

  it('preserves the literal type string even when unknown (non-radial path)', () => {
    // type !== 'radial' so it falls through to the linear default branch
    expect(buildGradient({ type: 'conic', angle: '', from: '#f00', to: '#00f' }))
      .toBe('conic-gradient(90deg, #f00, #00f)');
  });

  it('keeps a provided angle for an unknown type', () => {
    expect(buildGradient({ type: 'conic', angle: 'from 0deg', from: '#f00', to: '#00f' }))
      .toBe('conic-gradient(from 0deg, #f00, #00f)');
  });

  it('uses the type default of linear when type is omitted', () => {
    expect(buildGradient({ angle: '180deg', from: 'a', to: 'b' }))
      .toBe('linear-gradient(180deg, a, b)');
  });

  it('falls back to default from color when from is omitted', () => {
    expect(buildGradient({ type: 'linear', angle: '90deg', to: '#000' }))
      .toBe('linear-gradient(90deg, #ff6a00, #000)');
  });

  it('falls back to default to color when to is omitted', () => {
    expect(buildGradient({ type: 'linear', angle: '90deg', from: '#fff' }))
      .toBe('linear-gradient(90deg, #fff, #ee0979)');
  });

  it('coerces boolean option values to strings', () => {
    // String(true) === 'true', String(false) === 'false'
    const opts: ToolOptions = { type: 'linear', angle: '90deg', from: true, to: false };
    expect(buildGradient(opts)).toBe('linear-gradient(90deg, true, false)');
  });

  it('coerces a boolean type to its string form (not radial)', () => {
    const opts: ToolOptions = { type: true, angle: '', from: '#f00', to: '#00f' };
    // String(true) = 'true' !== 'radial' -> linear default angle
    expect(buildGradient(opts)).toBe('true-gradient(90deg, #f00, #00f)');
  });

  it('supports rgb()/hsl() color functions with internal commas', () => {
    expect(buildGradient({
      type: 'linear',
      angle: 'to right',
      from: 'rgb(255, 0, 0)',
      to: 'hsl(240, 100%, 50%)',
    })).toBe('linear-gradient(to right, rgb(255, 0, 0), hsl(240, 100%, 50%))');
  });

  it('supports "to bottom right" keyword angles', () => {
    expect(buildGradient({ type: 'linear', angle: 'to bottom right', from: '#000', to: '#fff' }))
      .toBe('linear-gradient(to bottom right, #000, #fff)');
  });

  it('supports radial shape/position syntax', () => {
    expect(buildGradient({
      type: 'radial',
      angle: 'ellipse at center',
      from: '#000',
      to: '#fff',
    })).toBe('radial-gradient(ellipse at center, #000, #fff)');
  });

  it('handles unicode/emoji and special chars passed through verbatim', () => {
    expect(buildGradient({ type: 'linear', angle: '90deg', from: '★color', to: 'café-😀' }))
      .toBe('linear-gradient(90deg, ★color, café-😀)');
  });

  it('handles a very large angle/color input without truncation', () => {
    const big = 'x'.repeat(5000);
    const out = buildGradient({ type: 'linear', angle: '90deg', from: big, to: '#000' });
    expect(out).toContain(big);
    expect(out.startsWith('linear-gradient(90deg, ')).toBe(true);
    expect(out.endsWith(', #000)')).toBe(true);
  });

  it('handles negative and zero angle values', () => {
    expect(buildGradient({ type: 'linear', angle: '-45deg', from: '#000', to: '#fff' }))
      .toBe('linear-gradient(-45deg, #000, #fff)');
    expect(buildGradient({ type: 'linear', angle: '0deg', from: '#000', to: '#fff' }))
      .toBe('linear-gradient(0deg, #000, #fff)');
  });

  it('is deterministic for identical inputs', () => {
    const opts: ToolOptions = { type: 'radial', angle: 'circle', from: '#1', to: '#2' };
    expect(buildGradient(opts)).toBe(buildGradient(opts));
  });

  it('always produces a parseable gradient() shape', () => {
    const out = buildGradient({ type: 'radial', angle: 'circle', from: 'red', to: 'blue' });
    expect(out).toMatch(/^[a-z]+-gradient\(.+, .+, .+\)$/);
  });
});

describe('cssGradient gradientCss', () => {
  it('wraps the value in a background declaration', () => {
    expect(gradientCss({ type: 'linear', angle: '45deg', from: 'red', to: 'blue' }))
      .toBe('background: linear-gradient(45deg, red, blue);');
  });

  it('wraps the default gradient for empty options', () => {
    expect(gradientCss({}))
      .toBe('background: linear-gradient(90deg, #ff6a00, #ee0979);');
  });

  it('embeds exactly the buildGradient output', () => {
    const opts: ToolOptions = { type: 'radial', angle: 'circle', from: '#000', to: '#fff' };
    expect(gradientCss(opts)).toBe(`background: ${buildGradient(opts)};`);
  });

  it('produces a valid CSS declaration that starts with background: and ends with ;', () => {
    const out = gradientCss({ type: 'linear', angle: '90deg', from: '#f00', to: '#00f' });
    expect(out.startsWith('background: ')).toBe(true);
    expect(out.endsWith(';')).toBe(true);
  });
});

describe('cssGradient GRADIENT_OPTIONS metadata', () => {
  it('exposes type, angle, from and to option keys', () => {
    const keys = GRADIENT_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(['type', 'angle', 'from', 'to']);
  });

  it('offers linear and radial choices for the type select', () => {
    const type = GRADIENT_OPTIONS.find((o) => o.key === 'type');
    expect(type?.type).toBe('select');
    expect(type?.choices?.map((c) => c.value)).toEqual(['linear', 'radial']);
  });

  it('defaults match the buildGradient fallbacks', () => {
    const byKey = Object.fromEntries(GRADIENT_OPTIONS.map((o) => [o.key, o.default]));
    expect(byKey.type).toBe('linear');
    expect(byKey.angle).toBe('90deg');
    expect(byKey.from).toBe('#ff6a00');
    expect(byKey.to).toBe('#ee0979');
  });
});

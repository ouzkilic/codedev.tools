import { describe, it, expect } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { buildShadow, boxShadowCss, SHADOW_OPTIONS } from './logic';

describe('boxShadow', () => {
  describe('buildShadow - happy paths', () => {
    it('builds a shadow from options', () => {
      expect(
        buildShadow({ x: '0', y: '4', blur: '12', spread: '0', color: 'rgba(0,0,0,0.25)', inset: false }),
      ).toBe('0px 4px 12px 0px rgba(0,0,0,0.25)');
    });

    it('adds inset when enabled', () => {
      expect(buildShadow({ x: '1', y: '1', blur: '2', spread: '0', color: '#000', inset: true })).toBe(
        'inset 1px 1px 2px 0px #000',
      );
    });

    it('builds shadow with hex color and no inset', () => {
      expect(buildShadow({ x: '5', y: '6', blur: '7', spread: '8', color: '#abc', inset: false })).toBe(
        '5px 6px 7px 8px #abc',
      );
    });
  });

  describe('boxShadowCss', () => {
    it('wraps in a box-shadow declaration', () => {
      expect(boxShadowCss({ x: '0', y: '2', blur: '4', spread: '0', color: '#333', inset: false })).toBe(
        'box-shadow: 0px 2px 4px 0px #333;',
      );
    });

    it('wraps inset shadow in a declaration', () => {
      expect(boxShadowCss({ x: '1', y: '1', blur: '0', spread: '0', color: '#fff', inset: true })).toBe(
        'box-shadow: inset 1px 1px 0px 0px #fff;',
      );
    });

    it('boxShadowCss equals buildShadow wrapped', () => {
      const opts: ToolOptions = { x: '3', y: '4', blur: '5', spread: '6', color: '#000', inset: false };
      expect(boxShadowCss(opts)).toBe(`box-shadow: ${buildShadow(opts)};`);
    });
  });

  describe('defaults / missing values', () => {
    it('falls back to all defaults for empty options', () => {
      expect(buildShadow({})).toBe('0px 4px 12px 0px rgba(0,0,0,0.25)');
    });

    it('uses default color when color missing', () => {
      expect(buildShadow({ x: '1', y: '1', blur: '1', spread: '1' })).toBe(
        '1px 1px 1px 1px rgba(0,0,0,0.25)',
      );
    });

    it('uses per-key default when a numeric field is missing', () => {
      // only x provided; y->4, blur->12, spread->0 from defaults
      expect(buildShadow({ x: '9' })).toBe('9px 4px 12px 0px rgba(0,0,0,0.25)');
    });
  });

  describe('empty / whitespace handling', () => {
    it('empty string numeric value falls back to default', () => {
      expect(buildShadow({ x: '', y: '', blur: '', spread: '', color: '#000', inset: false })).toBe(
        '0px 4px 12px 0px #000',
      );
    });

    it('whitespace-only numeric value falls back to default', () => {
      expect(buildShadow({ x: '   ', y: '\t', blur: '  ', spread: ' ', color: '#000', inset: false })).toBe(
        '0px 4px 12px 0px #000',
      );
    });

    it('trims surrounding whitespace from numeric values', () => {
      expect(buildShadow({ x: '  2  ', y: ' 3 ', blur: '4', spread: '5', color: '#000', inset: false })).toBe(
        '2px 3px 4px 5px #000',
      );
    });

    it('trims surrounding whitespace from color', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '  #f00  ', inset: false })).toBe(
        '0px 0px 0px 0px #f00',
      );
    });

    it('empty color falls back to default', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '', inset: false })).toBe(
        '0px 0px 0px 0px rgba(0,0,0,0.25)',
      );
    });

    it('whitespace-only color falls back to default', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '   ', inset: false })).toBe(
        '0px 0px 0px 0px rgba(0,0,0,0.25)',
      );
    });
  });

  describe('numeric edge cases', () => {
    it('handles negative values verbatim', () => {
      expect(buildShadow({ x: '-5', y: '-10', blur: '0', spread: '-2', color: '#000', inset: false })).toBe(
        '-5px -10px 0px -2px #000',
      );
    });

    it('handles zero values', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '#000', inset: false })).toBe(
        '0px 0px 0px 0px #000',
      );
    });

    it('handles decimal values', () => {
      expect(buildShadow({ x: '1.5', y: '2.25', blur: '0', spread: '0', color: '#000', inset: false })).toBe(
        '1.5px 2.25px 0px 0px #000',
      );
    });

    it('handles very large values', () => {
      expect(
        buildShadow({ x: '999999', y: '1000000', blur: '500000', spread: '0', color: '#000', inset: false }),
      ).toBe('999999px 1000000px 500000px 0px #000');
    });

    it('does not append px to values that already include a unit', () => {
      expect(buildShadow({ x: '5px', y: '0', blur: '0', spread: '0', color: '#000', inset: false })).toBe(
        '5px 0px 0px 0px #000',
      );
    });

    it('preserves non-px units verbatim', () => {
      expect(buildShadow({ x: '1em', y: '2rem', blur: '0', spread: '0', color: '#000', inset: false })).toBe(
        '1em 2rem 0px 0px #000',
      );
    });
  });

  describe('inset toggle behavior', () => {
    it('boolean false produces no inset', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '#000', inset: false })).not.toContain(
        'inset',
      );
    });

    it('boolean true produces inset prefix', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '#000', inset: true })).toMatch(
        /^inset /,
      );
    });

    it('string "false" is treated as disabled (no inset)', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '#000', inset: 'false' })).not.toContain(
        'inset',
      );
    });

    it('string "true" enables inset', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '#000', inset: 'true' })).toMatch(
        /^inset /,
      );
    });

    it('empty string for inset is falsy (no inset)', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: '#000', inset: '' })).not.toContain(
        'inset',
      );
    });
  });

  describe('color variety', () => {
    it('accepts rgba color', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: 'rgba(255,0,0,0.5)' })).toContain(
        'rgba(255,0,0,0.5)',
      );
    });

    it('accepts named color', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: 'red' })).toBe('0px 0px 0px 0px red');
    });

    it('accepts hsl color with spaces preserved internally', () => {
      expect(buildShadow({ x: '0', y: '0', blur: '0', spread: '0', color: 'hsl(0, 100%, 50%)' })).toBe(
        '0px 0px 0px 0px hsl(0, 100%, 50%)',
      );
    });
  });

  describe('SHADOW_OPTIONS metadata', () => {
    it('exposes the expected option keys', () => {
      expect(SHADOW_OPTIONS.map((o) => o.key)).toEqual(['x', 'y', 'blur', 'spread', 'color', 'inset']);
    });

    it('inset is a toggle defaulting to false', () => {
      const inset = SHADOW_OPTIONS.find((o) => o.key === 'inset');
      expect(inset?.type).toBe('toggle');
      expect(inset?.default).toBe(false);
    });

    it('numeric defaults match what buildShadow produces from empty options', () => {
      // derive expected default shadow from the option defaults themselves
      const get = (k: string) => String(SHADOW_OPTIONS.find((o) => o.key === k)?.default);
      const expected = `${get('x')}px ${get('y')}px ${get('blur')}px ${get('spread')}px ${get('color')}`;
      expect(buildShadow({})).toBe(expected);
    });
  });

  describe('determinism', () => {
    it('is deterministic for identical input', () => {
      const opts: ToolOptions = { x: '2', y: '2', blur: '8', spread: '1', color: '#123', inset: true };
      expect(buildShadow(opts)).toBe(buildShadow(opts));
    });
  });
});

import { describe, it, expect } from 'vitest';
import { unitConvertLogic } from './logic';

function run(input: string, from: string, to: string): string {
  return unitConvertLogic.transform(input, { options: { from, to }, secondary: '' });
}

describe('unitConvertLogic', () => {
  describe('length', () => {
    it('converts meters to kilometers', () => {
      expect(run('1000', 'm', 'km')).toBe('1');
    });

    it('converts kilometers to miles', () => {
      expect(run('1', 'km', 'mi')).toBe('0.621371');
    });

    it('converts miles to kilometers', () => {
      expect(run('1', 'mi', 'km')).toBe('1.60934');
    });

    it('converts inches to centimeters', () => {
      expect(run('1', 'in', 'cm')).toBe('2.54');
    });

    it('converts feet to inches', () => {
      expect(run('1', 'ft', 'in')).toBe('12');
    });

    it('converts yards to feet', () => {
      expect(run('1', 'yd', 'ft')).toBe('3');
    });

    it('converts negative values keeping sign', () => {
      expect(run('-1', 'km', 'mi')).toBe('-0.621371');
    });

    it('converts a large input', () => {
      expect(run('100000', 'mm', 'km')).toBe('0.1');
    });
  });

  describe('mass', () => {
    it('converts kilograms to pounds', () => {
      expect(run('1', 'kg', 'lb')).toBe('2.20462');
    });

    it('converts pounds to ounces', () => {
      expect(run('1', 'lb', 'oz')).toBe('16');
    });

    it('converts grams to milligrams', () => {
      expect(run('1', 'g', 'mg')).toBe('1000');
    });
  });

  describe('temperature', () => {
    it('converts 0 celsius to fahrenheit', () => {
      expect(run('0', 'c', 'f')).toBe('32');
    });

    it('converts 100 celsius to fahrenheit', () => {
      expect(run('100', 'c', 'f')).toBe('212');
    });

    it('converts 32 fahrenheit to celsius', () => {
      expect(run('32', 'f', 'c')).toBe('0');
    });

    it('converts 273.15 kelvin to celsius', () => {
      expect(run('273.15', 'k', 'c')).toBe('0');
    });

    it('converts 0 celsius to kelvin', () => {
      expect(run('0', 'c', 'k')).toBe('273.15');
    });

    it('converts 32 fahrenheit to kelvin', () => {
      expect(run('32', 'f', 'k')).toBe('273.15');
    });

    it('returns same value for identical temperature units', () => {
      expect(run('42', 'c', 'c')).toBe('42');
    });
  });

  describe('formatting and parsing', () => {
    it('formats zero as 0 regardless of unit', () => {
      expect(run('0', 'm', 'km')).toBe('0');
    });

    it('parses leading numeric portion via parseFloat', () => {
      // parseFloat('5kg') === 5, units come from options, not the input string
      expect(run('5kg', 'kg', 'g')).toBe('5000');
    });

    it('trims and lowercases unit names', () => {
      expect(run('1000', ' M ', ' KM ')).toBe('1');
    });

    it('limits result to 6 significant digits', () => {
      const out = run('1', 'mi', 'km');
      const sig = out.replace('-', '').replace('.', '').replace(/^0+/, '');
      expect(sig.length).toBeLessThanOrEqual(6);
    });
  });

  describe('round-trips', () => {
    it('km -> mi -> km recovers the original within precision', () => {
      const mi = run('5', 'km', 'mi');
      const back = run(mi, 'mi', 'km');
      expect(Number(back)).toBeCloseTo(5, 3);
    });

    it('c -> f -> c recovers the original', () => {
      const f = run('37', 'c', 'f');
      const back = run(f, 'f', 'c');
      expect(Number(back)).toBeCloseTo(37, 6);
    });
  });

  describe('error paths', () => {
    it('throws converting length to mass', () => {
      expect(() => run('5', 'm', 'kg')).toThrow('Cannot convert between different unit types.');
    });

    it('throws converting length to temperature', () => {
      expect(() => run('5', 'm', 'c')).toThrow('Cannot convert between different unit types.');
    });

    it('throws on an unknown unit', () => {
      expect(() => run('5', 'parsec', 'km')).toThrow('Cannot convert between different unit types.');
    });

    it('throws on a non-numeric input', () => {
      expect(() => run('abc', 'm', 'km')).toThrow('Invalid number.');
    });

    it('throws on empty input', () => {
      expect(() => run('', 'm', 'km')).toThrow('Invalid number.');
    });

    it('throws on whitespace-only input', () => {
      expect(() => run('   ', 'm', 'km')).toThrow('Invalid number.');
    });

    it('throws on an emoji input', () => {
      expect(() => run('🚀', 'm', 'km')).toThrow('Invalid number.');
    });
  });
});

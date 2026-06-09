import { describe, it, expect } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { generatePasswords, PASSWORD_OPTIONS } from './logic';

const base: ToolOptions = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
  count: '1',
  length: '16',
};

const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?';

describe('password', () => {
  describe('length handling', () => {
    it('respects the requested length', () => {
      expect(generatePasswords({ ...base, length: '24' })).toHaveLength(24);
    });

    it('defaults to length 16 when length is missing', () => {
      const { length: _omit, ...rest } = base;
      void _omit;
      expect(generatePasswords(rest)).toHaveLength(16);
    });

    it('defaults to length 16 when length is non-numeric', () => {
      expect(generatePasswords({ ...base, length: 'abc' })).toHaveLength(16);
    });

    it('defaults to length 16 when length is empty string', () => {
      expect(generatePasswords({ ...base, length: '' })).toHaveLength(16);
    });

    it('clamps length below 1 up to the minimum of 1', () => {
      expect(generatePasswords({ ...base, length: '0' })).toHaveLength(1);
    });

    it('clamps negative length up to the minimum of 1', () => {
      expect(generatePasswords({ ...base, length: '-5' })).toHaveLength(1);
    });

    it('clamps length above 256 down to the maximum of 256', () => {
      expect(generatePasswords({ ...base, length: '1000' })).toHaveLength(256);
    });

    it('allows exactly the maximum length 256', () => {
      expect(generatePasswords({ ...base, length: '256' })).toHaveLength(256);
    });

    it('parses leading-numeric strings via parseInt', () => {
      // parseInt('12px', 10) === 12
      expect(generatePasswords({ ...base, length: '12px' })).toHaveLength(12);
    });
  });

  describe('count handling', () => {
    it('generates a single password by default', () => {
      expect(generatePasswords({ ...base, count: '1' }).split('\n')).toHaveLength(1);
    });

    it('generates multiple passwords on separate lines', () => {
      expect(generatePasswords({ ...base, length: '12', count: '3' }).split('\n')).toHaveLength(3);
    });

    it('defaults count to 1 when non-numeric', () => {
      expect(generatePasswords({ ...base, count: 'xyz' }).split('\n')).toHaveLength(1);
    });

    it('clamps count below 1 up to 1', () => {
      expect(generatePasswords({ ...base, count: '0' }).split('\n')).toHaveLength(1);
    });

    it('clamps count above 100 down to 100', () => {
      expect(generatePasswords({ ...base, count: '500' }).split('\n')).toHaveLength(100);
    });

    it('allows exactly the maximum count 100', () => {
      expect(generatePasswords({ ...base, count: '100' }).split('\n')).toHaveLength(100);
    });

    it('each generated password in a batch has the requested length', () => {
      const lines = generatePasswords({ ...base, length: '20', count: '5' }).split('\n');
      expect(lines).toHaveLength(5);
      for (const line of lines) expect(line).toHaveLength(20);
    });
  });

  describe('character set selection', () => {
    it('uses only digits when only numbers are enabled', () => {
      const pw = generatePasswords({
        length: '40',
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        count: '1',
      });
      expect(pw).toMatch(/^[0-9]+$/);
    });

    it('uses only lowercase when only lowercase is enabled', () => {
      const pw = generatePasswords({
        length: '50',
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        count: '1',
      });
      expect(pw).toMatch(/^[a-z]+$/);
    });

    it('uses only uppercase when only uppercase is enabled', () => {
      const pw = generatePasswords({
        length: '50',
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        count: '1',
      });
      expect(pw).toMatch(/^[A-Z]+$/);
    });

    it('uses only symbols when only symbols are enabled', () => {
      const pw = generatePasswords({
        length: '60',
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        count: '1',
      });
      // every char must be from the symbol set
      for (const ch of pw) expect(SYMBOLS).toContain(ch);
    });

    it('restricts output to the combined pool when multiple sets enabled', () => {
      const pw = generatePasswords({
        length: '80',
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: false,
        count: '1',
      });
      expect(pw).toMatch(/^[a-zA-Z]+$/);
    });

    it('can include all four sets without error', () => {
      const pw = generatePasswords({
        length: '64',
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        count: '1',
      });
      const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + SYMBOLS;
      for (const ch of pw) expect(allowed).toContain(ch);
      expect(pw).toHaveLength(64);
    });

    it('throws when no character set is selected', () => {
      expect(() =>
        generatePasswords({
          length: '16',
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
          count: '1',
        }),
      ).toThrow(/character set/i);
    });

    it('throws when sets are absent (undefined toggles)', () => {
      expect(() => generatePasswords({ length: '16', count: '1' })).toThrow(/character set/i);
    });

    it('truthiness: a single enabled set with falsy others still works', () => {
      const pw = generatePasswords({
        length: '10',
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        count: '1',
      });
      expect(pw).toHaveLength(10);
    });
  });

  describe('randomness properties', () => {
    it('does not append a trailing newline for a single password', () => {
      const pw = generatePasswords({ ...base, count: '1' });
      expect(pw.endsWith('\n')).toBe(false);
    });

    it('joins exactly count-1 newlines', () => {
      const pw = generatePasswords({ ...base, length: '8', count: '4' });
      expect((pw.match(/\n/g) ?? []).length).toBe(3);
    });

    it('produces statistically varied output (not all identical chars)', () => {
      // With length 200 over a 26-char pool, extremely unlikely to be uniform.
      const pw = generatePasswords({
        length: '200',
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        count: '1',
      });
      const unique = new Set(pw.split(''));
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('PASSWORD_OPTIONS metadata', () => {
    it('exposes all expected option keys', () => {
      const keys = PASSWORD_OPTIONS.map((o) => o.key);
      expect(keys).toEqual(['length', 'uppercase', 'lowercase', 'numbers', 'symbols', 'count']);
    });

    it('defaults match the documented behavior', () => {
      const byKey = Object.fromEntries(PASSWORD_OPTIONS.map((o) => [o.key, o.default]));
      expect(byKey.length).toBe('16');
      expect(byKey.count).toBe('1');
      expect(byKey.uppercase).toBe(true);
      expect(byKey.lowercase).toBe(true);
      expect(byKey.numbers).toBe(true);
      expect(byKey.symbols).toBe(false);
    });
  });
});

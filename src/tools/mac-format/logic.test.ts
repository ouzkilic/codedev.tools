import { describe, it, expect } from 'vitest';
import { macFormatLogic } from './logic';

const fmt = (s: string, format = 'colon', caseOpt = 'lower') =>
  macFormatLogic.transform(s, { options: { format, case: caseOpt }, secondary: '' });

describe('macFormat', () => {
  it('formats with colons in lowercase', () => {
    expect(fmt('AABBCCDDEEFF', 'colon', 'lower')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('formats with hyphens in uppercase', () => {
    expect(fmt('00:1a:2b:3c:4d:5e', 'hyphen', 'upper')).toBe('00-1A-2B-3C-4D-5E');
  });

  it('formats with dots (grouped by 4)', () => {
    expect(fmt('AABBCCDDEEFF', 'dot')).toBe('aabb.ccdd.eeff');
  });

  it('formats with no separator', () => {
    expect(fmt('AA:BB:CC:DD:EE:FF', 'none')).toBe('aabbccddeeff');
  });

  it('uppercases dot format', () => {
    expect(fmt('aabbccddeeff', 'dot', 'upper')).toBe('AABB.CCDD.EEFF');
  });

  it('uppercases none format', () => {
    expect(fmt('aabbccddeeff', 'none', 'upper')).toBe('AABBCCDDEEFF');
  });

  it('lowercases hyphen format', () => {
    expect(fmt('AA-BB-CC-DD-EE-FF', 'hyphen', 'lower')).toBe('aa-bb-cc-dd-ee-ff');
  });

  it('defaults to colon + lower when options omitted', () => {
    expect(macFormatLogic.transform('AABBCCDDEEFF')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('defaults to colon when only case provided', () => {
    expect(
      macFormatLogic.transform('AABBCCDDEEFF', { options: { case: 'upper' }, secondary: '' }),
    ).toBe('AA:BB:CC:DD:EE:FF');
  });

  it('falls back to colon for an unknown format value', () => {
    expect(fmt('aabbccddeeff', 'weird')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('treats any non-upper case value as lowercase', () => {
    expect(fmt('AABBCCDDEEFF', 'colon', 'mixed')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('strips arbitrary separators before formatting', () => {
    expect(fmt('aa.bb cc-dd_ee/ff', 'colon')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('strips leading and trailing separators', () => {
    expect(fmt(':aa:bb:cc:dd:ee:ff:', 'colon')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('strips surrounding whitespace and newlines', () => {
    expect(fmt('  aabb\ncc dd\tee ff  ', 'none')).toBe('aabbccddeeff');
  });

  it('ignores unicode and emoji between hex digits', () => {
    expect(fmt('aa🚀bb€cc—dd…ee ff', 'colon')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('keeps a valid 12-digit run when surrounded by non-hex noise', () => {
    expect(fmt('zz aabbccddeeff zz', 'colon')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('preserves numeric/boundary hex digits 00 and ff', () => {
    expect(fmt('00000000ffff', 'colon')).toBe('00:00:00:00:ff:ff');
  });

  it('throws on empty string', () => {
    expect(() => fmt('')).toThrow('A MAC address has 12 hex digits.');
  });

  it('throws on whitespace-only input', () => {
    expect(() => fmt('     \n\t  ')).toThrow();
  });

  it('throws on too few hex digits', () => {
    expect(() => fmt('00:11')).toThrow();
  });

  it('throws when there are 11 hex digits', () => {
    expect(() => fmt('aabbccddeef')).toThrow('A MAC address has 12 hex digits.');
  });

  it('throws when there are 13 hex digits', () => {
    expect(() => fmt('aabbccddeeff0')).toThrow();
  });

  it('throws when only non-hex characters are present', () => {
    expect(() => fmt('ghijklmnopqr')).toThrow();
  });

  it('round-trips: format to colon then strip-and-reformat is idempotent', () => {
    const once = fmt('aabbccddeeff', 'colon');
    expect(fmt(once, 'colon')).toBe(once);
  });

  it('is deterministic across separator representations of the same address', () => {
    const a = fmt('AA:BB:CC:DD:EE:FF', 'dot');
    const b = fmt('AA-BB-CC-DD-EE-FF', 'dot');
    const c = fmt('aabb.ccdd.eeff', 'dot');
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('converts between formats reversibly (dot -> none -> colon)', () => {
    const none = fmt('aabb.ccdd.eeff', 'none');
    expect(none).toBe('aabbccddeeff');
    expect(fmt(none, 'colon')).toBe('aa:bb:cc:dd:ee:ff');
  });

  it('exposes format and case select options with expected choices', () => {
    const opts = macFormatLogic.options ?? [];
    const formatOpt = opts.find((o) => o.key === 'format');
    const caseOpt = opts.find((o) => o.key === 'case');
    expect(formatOpt?.default).toBe('colon');
    expect(caseOpt?.default).toBe('lower');
    expect(formatOpt?.choices?.map((c) => c.value)).toEqual([
      'colon',
      'hyphen',
      'dot',
      'none',
    ]);
    expect(caseOpt?.choices?.map((c) => c.value)).toEqual(['lower', 'upper']);
  });
});

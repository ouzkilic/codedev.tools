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
  it('formats with dots', () => {
    expect(fmt('AABBCCDDEEFF', 'dot')).toBe('aabb.ccdd.eeff');
  });
  it('throws on too few hex digits', () => {
    expect(() => fmt('00:11')).toThrow();
  });
});

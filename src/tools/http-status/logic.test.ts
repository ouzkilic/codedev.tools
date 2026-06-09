import { describe, it, expect } from 'vitest';
import { httpStatusLogic } from './logic';

const lines = (s: string) => s.split('\n');

describe('httpStatus', () => {
  // --- existing assertions (kept) ---
  it('looks up an exact code', () => {
    expect(httpStatusLogic.transform('404')).toBe('404 Not Found');
  });
  it('searches by text', () => {
    expect(httpStatusLogic.transform('teapot')).toContain('418');
  });
  it('matches a code prefix', () => {
    expect(lines(httpStatusLogic.transform('20')).length).toBeGreaterThan(1);
  });
  it('throws when nothing matches', () => {
    expect(() => httpStatusLogic.transform('zzzz')).toThrow();
  });

  // --- exact code lookups ---
  it('returns exactly one line for a full unique code', () => {
    const out = httpStatusLogic.transform('404');
    expect(lines(out)).toEqual(['404 Not Found']);
  });
  it('returns the teapot text exactly', () => {
    // 418 is the only code beginning with "418"
    expect(httpStatusLogic.transform('418')).toBe("418 I'm a Teapot");
  });
  it('looks up 500 internal server error', () => {
    expect(httpStatusLogic.transform('500')).toBe('500 Internal Server Error');
  });
  it('looks up 100 Continue', () => {
    expect(httpStatusLogic.transform('100')).toBe('100 Continue');
  });

  // --- numeric prefix branch ---
  it('prefix "2" returns all 2xx codes (5 of them)', () => {
    const out = lines(httpStatusLogic.transform('2'));
    expect(out).toEqual([
      '200 OK',
      '201 Created',
      '202 Accepted',
      '204 No Content',
      '206 Partial Content',
    ]);
  });
  it('prefix "20" matches the same 2xx set since all start with 20', () => {
    expect(lines(httpStatusLogic.transform('20'))).toHaveLength(5);
  });
  it('prefix "4" returns all 4xx codes (15 of them)', () => {
    expect(lines(httpStatusLogic.transform('4'))).toHaveLength(15);
  });
  it('prefix "1" returns the 1xx codes (100, 101, 103)', () => {
    expect(lines(httpStatusLogic.transform('1'))).toEqual([
      '100 Continue',
      '101 Switching Protocols',
      '103 Early Hints',
    ]);
  });
  it('prefix "40" returns 4xx codes whose second digit is 0', () => {
    expect(lines(httpStatusLogic.transform('40'))).toEqual([
      '400 Bad Request',
      '401 Unauthorized',
      '402 Payment Required',
      '403 Forbidden',
      '404 Not Found',
      '405 Method Not Allowed',
      '406 Not Acceptable',
      '408 Request Timeout',
      '409 Conflict',
    ]);
  });
  it('throws for an all-digit query that matches no code prefix', () => {
    expect(() => httpStatusLogic.transform('999')).toThrow('No matching HTTP status code.');
  });
  it('throws for prefix "00" (no code starts with 00)', () => {
    expect(() => httpStatusLogic.transform('00')).toThrow();
  });

  // --- text search branch ---
  it('text search is case-insensitive', () => {
    expect(httpStatusLogic.transform('NOT FOUND')).toBe('404 Not Found');
    expect(httpStatusLogic.transform('not found')).toBe('404 Not Found');
  });
  it('text "gateway" matches Bad Gateway and Gateway Timeout', () => {
    expect(lines(httpStatusLogic.transform('gateway'))).toEqual([
      '502 Bad Gateway',
      '504 Gateway Timeout',
    ]);
  });
  it('text "not" matches every status whose text contains "not"', () => {
    expect(lines(httpStatusLogic.transform('not'))).toEqual([
      '304 Not Modified',
      '404 Not Found',
      '405 Method Not Allowed',
      '406 Not Acceptable',
      '501 Not Implemented',
    ]);
  });
  it('partial word "unauth" matches Unauthorized', () => {
    expect(httpStatusLogic.transform('unauth')).toBe('401 Unauthorized');
  });

  // --- whitespace handling ---
  it('trims surrounding whitespace before lookup', () => {
    expect(httpStatusLogic.transform('   404   ')).toBe('404 Not Found');
  });
  it('whitespace-only input falls to text branch and matches everything', () => {
    // trim() -> '' -> not /^\d+$/ -> text.includes('') is true for all
    expect(lines(httpStatusLogic.transform('   '))).toHaveLength(35);
  });
  it('empty string returns all 35 statuses (includes("") matches all)', () => {
    expect(lines(httpStatusLogic.transform(''))).toHaveLength(35);
  });

  // --- edge / special characters ---
  it('emoji query throws (no text or code contains it)', () => {
    expect(() => httpStatusLogic.transform('🚀')).toThrow();
  });
  it('special chars with no match throw', () => {
    expect(() => httpStatusLogic.transform('@@@')).toThrow();
  });
  it('apostrophe inside text is searchable (teapot uses one)', () => {
    expect(httpStatusLogic.transform("i'm a teapot")).toBe("418 I'm a Teapot");
  });
  it('very large numeric input that is no prefix throws', () => {
    expect(() => httpStatusLogic.transform('1'.repeat(50))).toThrow();
  });

  // --- determinism / structure ---
  it('is deterministic across repeated calls', () => {
    const a = httpStatusLogic.transform('5');
    const b = httpStatusLogic.transform('5');
    expect(a).toBe(b);
  });
  it('every output line follows the "<code> <text>" shape', () => {
    const out = lines(httpStatusLogic.transform(''));
    for (const line of out) {
      expect(line).toMatch(/^\d{3} .+/);
    }
  });
  it('preserves registry order (200 appears before 404)', () => {
    const out = httpStatusLogic.transform('');
    expect(out.indexOf('200 OK')).toBeLessThan(out.indexOf('404 Not Found'));
  });
});

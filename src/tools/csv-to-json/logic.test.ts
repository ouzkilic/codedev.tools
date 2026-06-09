import { describe, it, expect } from 'vitest';
import { csvToJsonLogic } from './logic';

const toObj = (s: string) => JSON.parse(csvToJsonLogic.transform(s));

describe('csvToJson', () => {
  // --- existing assertions (kept) ---
  it('uses the header row as object keys', () => {
    expect(toObj('a,b\n1,2\n3,4')).toEqual([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
  });
  it('coerces types and keeps strings', () => {
    expect(toObj('name,active\nAda,true')).toEqual([{ name: 'Ada', active: true }]);
  });
  it('skips empty lines', () => {
    expect(toObj('a\n1\n\n2')).toEqual([{ a: 1 }, { a: 2 }]);
  });

  // --- output shape / formatting ---
  it('returns a JSON string pretty-printed with 2-space indent', () => {
    const out = csvToJsonLogic.transform('a,b\n1,2');
    expect(out).toBe('[\n  {\n    "a": 1,\n    "b": 2\n  }\n]');
  });
  it('always produces a JSON array at the top level', () => {
    expect(Array.isArray(toObj('a\n1'))).toBe(true);
  });

  // --- empty / whitespace inputs ---
  it('returns an empty array for empty input', () => {
    expect(toObj('')).toEqual([]);
  });
  it('returns an empty array for whitespace-only input', () => {
    expect(toObj('   \n   \t  ')).toEqual([]);
  });
  it('returns an empty array for a header-only file (no data rows)', () => {
    expect(toObj('a,b')).toEqual([]);
  });
  it('trims surrounding whitespace from the whole input before parsing', () => {
    expect(toObj('\n\n  a,b\n1,2  \n\n')).toEqual([{ a: 1, b: 2 }]);
  });

  // --- dynamic typing ---
  it('coerces unquoted integers to numbers', () => {
    expect(toObj('n\n42')).toEqual([{ n: 42 }]);
  });
  it('coerces negative, zero and float values', () => {
    expect(toObj('n\n-5\n0\n3.14')).toEqual([{ n: -5 }, { n: 0 }, { n: 3.14 }]);
  });
  it('coerces scientific-notation numbers', () => {
    expect(toObj('n\n1e10')).toEqual([{ n: 10000000000 }]);
  });
  it('coerces booleans (true / false)', () => {
    expect(toObj('flag\ntrue\nfalse')).toEqual([{ flag: true }, { flag: false }]);
  });
  it('coerces quoted numeric and boolean strings too (dynamicTyping)', () => {
    expect(toObj('x\n"true"')).toEqual([{ x: true }]);
  });
  it('maps an empty field to null', () => {
    expect(toObj('a,b\n1,')).toEqual([{ a: 1, b: null }]);
  });
  it('maps a leading-separator empty field to null', () => {
    expect(toObj('a,b\n,2')).toEqual([{ a: null, b: 2 }]);
  });

  // --- quoting / escaping ---
  it('respects quoted fields containing the delimiter', () => {
    expect(toObj('a,b\n"x,y",2')).toEqual([{ a: 'x,y', b: 2 }]);
  });
  it('respects quoted fields containing newlines', () => {
    expect(toObj('a,b\n"line1\nline2",2')).toEqual([{ a: 'line1\nline2', b: 2 }]);
  });
  it('unescapes doubled quotes inside a quoted field', () => {
    expect(toObj('a\n"he said ""hi"""')).toEqual([{ a: 'he said "hi"' }]);
  });

  // --- line endings ---
  it('handles CRLF line endings', () => {
    expect(toObj('a,b\r\n1,2\r\n3,4')).toEqual([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
  });

  // --- unicode ---
  it('preserves unicode / emoji content', () => {
    expect(toObj('name\n😀\nüç')).toEqual([{ name: '😀' }, { name: 'üç' }]);
  });

  // --- headers ---
  it('renames duplicate headers to avoid key collisions', () => {
    expect(toObj('a,a\n1,2')).toEqual([{ a: 1, a_1: 2 }]);
  });
  it('handles a single-column file (delimiter auto-detect warning is ignored)', () => {
    expect(toObj('id\n1\n2\n3')).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  // --- large input / determinism ---
  it('handles a large number of rows', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => `${i},${i * 2}`).join('\n');
    const result = toObj(`a,b\n${rows}`);
    expect(result).toHaveLength(1000);
    expect(result[0]).toEqual({ a: 0, b: 0 });
    expect(result[999]).toEqual({ a: 999, b: 1998 });
  });
  it('is deterministic across repeated calls', () => {
    const input = 'a,b\n1,2\n3,4';
    expect(csvToJsonLogic.transform(input)).toBe(csvToJsonLogic.transform(input));
  });

  // --- error paths ---
  it('throws when a row has too many fields', () => {
    expect(() => csvToJsonLogic.transform('a,b\n1,2,3')).toThrow(/Too many fields/);
  });
  it('throws when a row has too few fields', () => {
    expect(() => csvToJsonLogic.transform('a,b,c\n1,2')).toThrow(/Too few fields/);
  });
  it('includes the (1-based) row number in the thrown error', () => {
    expect(() => csvToJsonLogic.transform('a,b\n1,2,3')).toThrow(/row 1/);
  });
  it('throws on an unterminated quoted field', () => {
    expect(() => csvToJsonLogic.transform('a,b\n"unclosed,2')).toThrow(/unterminated/i);
  });
});

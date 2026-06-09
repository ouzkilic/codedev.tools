import { describe, expect, it } from 'vitest';
import { formatExif } from './logic';

describe('formatExif', () => {
  it('returns message for null', () => {
    expect(formatExif(null)).toBe('No EXIF metadata found.');
  });

  it('returns message for undefined', () => {
    expect(formatExif(undefined)).toBe('No EXIF metadata found.');
  });

  it('returns message for empty object', () => {
    expect(formatExif({})).toBe('No EXIF metadata found.');
  });

  it('formats key/value pairs', () => {
    const out = formatExif({ Make: 'Canon', ISO: 100 });
    expect(out).toContain('Make: Canon');
    expect(out).toContain('ISO: 100');
  });

  it('skips undefined values', () => {
    const out = formatExif({ Make: 'Canon', Model: undefined });
    expect(out).toBe('Make: Canon');
  });

  it('returns message when all values are undefined', () => {
    expect(formatExif({ a: undefined, b: undefined })).toBe('No EXIF metadata found.');
  });

  it('serializes Date as ISO string', () => {
    const d = new Date('2020-01-02T03:04:05.000Z');
    expect(formatExif({ DateTime: d })).toBe('DateTime: 2020-01-02T03:04:05.000Z');
  });

  it('JSON-stringifies object and array values', () => {
    const out = formatExif({ GPS: { lat: 1, lng: 2 }, Tags: ['a', 'b'] });
    expect(out).toContain('GPS: {"lat":1,"lng":2}');
    expect(out).toContain('Tags: ["a","b"]');
  });

  it('joins multiple lines with newlines preserving insertion order', () => {
    const out = formatExif({ Make: 'Canon', Model: 'EOS', ISO: 200 });
    expect(out).toBe('Make: Canon\nModel: EOS\nISO: 200');
  });

  it('renders null value as the string "null" (not skipped)', () => {
    // String(null) -> "null"; the v !== null guard only gates the object branch
    expect(formatExif({ Make: null })).toBe('Make: null');
  });

  it('renders boolean values via String()', () => {
    expect(formatExif({ Flash: true, Cropped: false })).toBe('Flash: true\nCropped: false');
  });

  it('renders numeric edge values: zero, negative, float', () => {
    const out = formatExif({ Zero: 0, Neg: -10, Float: 1.5 });
    expect(out).toBe('Zero: 0\nNeg: -10\nFloat: 1.5');
  });

  it('renders NaN and Infinity via String()', () => {
    const out = formatExif({ A: NaN, B: Infinity, C: -Infinity });
    expect(out).toBe('A: NaN\nB: Infinity\nC: -Infinity');
  });

  it('renders bigint via String()', () => {
    expect(formatExif({ Big: 9007199254740993n })).toBe('Big: 9007199254740993');
  });

  it('handles empty string value', () => {
    expect(formatExif({ Comment: '' })).toBe('Comment: ');
  });

  it('handles whitespace-only key and value', () => {
    expect(formatExif({ '   ': '   ' })).toBe('   :    ');
  });

  it('preserves unicode and emoji in values', () => {
    const out = formatExif({ Artist: 'Ören 📷', City: 'İstanbul' });
    expect(out).toBe('Artist: Ören 📷\nCity: İstanbul');
  });

  it('preserves special characters and newlines inside string values', () => {
    expect(formatExif({ Note: 'line1\nline2\t<>&' })).toBe('Note: line1\nline2\t<>&');
  });

  it('stringifies nested objects and arrays', () => {
    const out = formatExif({ GPS: { lat: 1, sub: { z: [1, 2] } } });
    expect(out).toBe('GPS: {"lat":1,"sub":{"z":[1,2]}}');
  });

  it('stringifies an empty array and empty object', () => {
    const out = formatExif({ Arr: [], Obj: {} });
    expect(out).toBe('Arr: []\nObj: {}');
  });

  it('stringifies array containing a Date as ISO inside JSON', () => {
    const d = new Date('2021-06-07T08:09:10.000Z');
    // JSON.stringify serializes Date to its ISO string with quotes
    expect(formatExif({ Dates: [d] })).toBe('Dates: ["2021-06-07T08:09:10.000Z"]');
  });

  it('treats Date branch before generic object branch', () => {
    const d = new Date('1999-12-31T23:59:59.000Z');
    expect(formatExif({ When: d })).toBe('When: 1999-12-31T23:59:59.000Z');
  });

  it('renders Invalid Date as ISO call would throw? -> uses toISOString', () => {
    // An invalid Date is still instanceof Date; toISOString throws RangeError.
    expect(() => formatExif({ Bad: new Date('not-a-date') })).toThrow(RangeError);
  });

  it('skips only undefined among a mix, keeping null', () => {
    const out = formatExif({ a: undefined, b: null, c: 'x' });
    expect(out).toBe('b: null\nc: x');
  });

  it('handles a large input deterministically', () => {
    const data: Record<string, number> = {};
    for (let i = 0; i < 500; i++) data[`Tag${i}`] = i;
    const out = formatExif(data);
    const lines = out.split('\n');
    expect(lines).toHaveLength(500);
    expect(lines[0]).toBe('Tag0: 0');
    expect(lines[499]).toBe('Tag499: 499');
  });

  it('is deterministic for identical input', () => {
    const input = { Make: 'Nikon', ISO: 400, GPS: { lat: 1 } };
    expect(formatExif(input)).toBe(formatExif(input));
  });
});

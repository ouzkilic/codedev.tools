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

  it('serializes Date as ISO string', () => {
    const d = new Date('2020-01-02T03:04:05.000Z');
    expect(formatExif({ DateTime: d })).toBe('DateTime: 2020-01-02T03:04:05.000Z');
  });

  it('JSON-stringifies object and array values', () => {
    const out = formatExif({ GPS: { lat: 1, lng: 2 }, Tags: ['a', 'b'] });
    expect(out).toContain('GPS: {"lat":1,"lng":2}');
    expect(out).toContain('Tags: ["a","b"]');
  });
});

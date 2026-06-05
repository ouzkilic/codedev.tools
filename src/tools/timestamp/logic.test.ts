import { describe, it, expect } from 'vitest';
import { timestampLogic } from './logic';

const toDate = (s: string) => timestampLogic.transform(s, { options: { mode: 'to-date' }, secondary: '' });
const toTs = (s: string) => timestampLogic.transform(s, { options: { mode: 'to-timestamp' }, secondary: '' });

describe('timestamp', () => {
  it('converts epoch seconds to an ISO date', () => {
    expect(toDate('0')).toContain('ISO 8601:   1970-01-01T00:00:00.000Z');
  });
  it('treats 10-digit values as seconds', () => {
    expect(toDate('1700000000')).toContain('2023-11-14T22:13:20.000Z');
  });
  it('treats 13-digit values as milliseconds', () => {
    expect(toDate('1700000000000')).toContain('2023-11-14T22:13:20.000Z');
  });
  it('converts an ISO date back to a timestamp', () => {
    const out = toTs('1970-01-01T00:00:00.000Z');
    expect(out).toContain('Unix (s):   0');
    expect(out).toContain('Unix (ms):  0');
  });
  it('throws on non-numeric timestamp input', () => {
    expect(() => toDate('not a number')).toThrow();
  });
  it('throws on an unparseable date', () => {
    expect(() => toTs('not a date')).toThrow();
  });
});

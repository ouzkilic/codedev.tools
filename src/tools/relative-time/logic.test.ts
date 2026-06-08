import { describe, expect, it } from 'vitest';
import { relativeTime, relativeTimeLogic } from './logic';

describe('relativeTime', () => {
  it('formats a future date one day ahead', () => {
    const date = new Date('2024-01-02T00:00:00Z');
    const now = new Date('2024-01-01T00:00:00Z');
    expect(relativeTime(date, now)).toBe('in 1 day');
  });

  it('formats a past date one day ago', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const now = new Date('2024-01-02T00:00:00Z');
    expect(relativeTime(date, now)).toBe('1 day ago');
  });

  it('formats seconds', () => {
    const date = new Date('2024-01-01T00:00:30Z');
    const now = new Date('2024-01-01T00:00:00Z');
    expect(relativeTime(date, now)).toBe('in 30 seconds');
  });

  it('throws on an unparseable date', () => {
    expect(() => relativeTimeLogic.transform('x')).toThrow('Could not parse the date.');
  });
});

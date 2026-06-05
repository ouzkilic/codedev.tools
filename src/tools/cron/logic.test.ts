import { describe, it, expect } from 'vitest';
import { cronLogic } from './logic';

describe('cron', () => {
  it('explains a daily-at-midnight expression', () => {
    expect(cronLogic.transform('0 0 * * *')).toBe('At 12:00 AM');
  });
  it('explains an interval expression', () => {
    expect(cronLogic.transform('*/5 * * * *')).toBe('Every 5 minutes');
  });
  it('throws on an invalid expression', () => {
    expect(() => cronLogic.transform('not a cron')).toThrow();
  });
});

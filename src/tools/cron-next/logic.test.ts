import { describe, expect, it } from 'vitest';
import { computeNextRuns, cronNextLogic } from './logic';

describe('computeNextRuns', () => {
  it('returns the next runs for a 15-minute schedule', () => {
    const result = computeNextRuns('*/15 * * * *', 2, new Date('2024-01-01T00:00:00Z'));
    expect(result).toEqual(['2024-01-01T00:15:00.000Z', '2024-01-01T00:30:00.000Z']);
  });

  it('returns the next midnight run', () => {
    const result = computeNextRuns('0 0 * * *', 1, new Date('2024-01-01T12:00:00Z'));
    expect(result[0]).toBe('2024-01-02T00:00:00.000Z');
  });
});

describe('cronNextLogic.transform', () => {
  it('throws on an invalid expression', () => {
    expect(() => cronNextLogic.transform('nonsense')).toThrow('Invalid cron expression.');
  });
});

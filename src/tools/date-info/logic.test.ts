import { describe, it, expect } from 'vitest';
import { dateInfoLogic } from './logic';

describe('dateInfoLogic', () => {
  it('reports full info for 2024-01-01', () => {
    const out = dateInfoLogic.transform('2024-01-01');
    expect(out).toContain('Weekday:     Monday');
    expect(out).toContain('Day of year: 1');
    expect(out).toContain('ISO week:    1');
    expect(out).toContain('Quarter:     Q1');
    expect(out).toContain('Leap year:   yes');
  });

  it('reports Sunday for 2023-12-31', () => {
    const out = dateInfoLogic.transform('2023-12-31');
    expect(out).toContain('Weekday:     Sunday');
    expect(out).toContain('Leap year:   no');
  });

  it('computes day of year and days in month for 2023-03-15', () => {
    const out = dateInfoLogic.transform('2023-03-15');
    expect(out).toContain('Day of year: 74');
    expect(out).toContain('Quarter:     Q1');
    expect(out).toContain('Days in month: 31');
  });

  it('puts October in Q4 with 31 days', () => {
    const out = dateInfoLogic.transform('2022-10-10');
    expect(out).toContain('Quarter:     Q4');
    expect(out).toContain('Days in month: 31');
  });

  it('handles ISO week rollover for 2021-01-04', () => {
    const out = dateInfoLogic.transform('2021-01-04');
    expect(out).toContain('ISO week:    1');
  });

  it('throws on invalid input', () => {
    expect(() => dateInfoLogic.transform('x')).toThrow();
  });
});

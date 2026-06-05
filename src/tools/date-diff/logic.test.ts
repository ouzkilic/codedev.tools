import { describe, it, expect } from 'vitest';
import { dateDiffLogic } from './logic';

const diff = (a: string, b: string) => dateDiffLogic.transform(a, { options: {}, secondary: b });

describe('dateDiff', () => {
  it('computes day difference', () => {
    expect(diff('2024-01-01', '2024-01-08')).toContain('Days:         7');
  });
  it('is order-independent (absolute)', () => {
    expect(diff('2024-01-08', '2024-01-01')).toContain('Days:         7');
  });
  it('computes hours', () => {
    expect(diff('2024-01-01T00:00:00Z', '2024-01-01T06:00:00Z')).toContain('Hours:        6');
  });
  it('throws on an unparseable date', () => {
    expect(() => diff('nope', '2024-01-01')).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { buildRandom } from './logic';

describe('buildRandom', () => {
  it('produces the requested count of integers within range', () => {
    const lines = buildRandom({ type: 'integer', min: '1', max: '6', count: '10' }).split('\n');
    expect(lines).toHaveLength(10);
    for (const line of lines) {
      const n = parseInt(line, 10);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('produces hex strings of the requested length', () => {
    expect(buildRandom({ type: 'hex', length: '8', count: '1' })).toMatch(/^[0-9a-f]{8}$/);
  });

  it('produces alphanumeric strings of the requested length', () => {
    expect(buildRandom({ type: 'alphanumeric', length: '12', count: '1' })).toMatch(
      /^[A-Za-z0-9]{12}$/,
    );
  });

  it('produces floats with 4 decimal places within range', () => {
    const lines = buildRandom({ type: 'float', min: '0', max: '1', count: '5' }).split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(/^\d+\.\d{4}$/);
      const v = Number(line);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

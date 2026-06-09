import { describe, expect, it } from 'vitest';
import {
  RANDOM_OPTIONS,
  buildRandom,
  randomFloat,
  randomFromAlphabet,
  randomInt,
  randomUnit,
} from './logic';

describe('randomUnit', () => {
  it('always returns a value in [0, 1)', () => {
    for (let i = 0; i < 200; i++) {
      const u = randomUnit();
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });
});

describe('randomInt', () => {
  it('returns an integer within the inclusive range', () => {
    for (let i = 0; i < 200; i++) {
      const n = randomInt(1, 6);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('handles a single-value range (min === max)', () => {
    for (let i = 0; i < 20; i++) {
      expect(randomInt(7, 7)).toBe(7);
    }
  });

  it('swaps reversed bounds (min > max)', () => {
    for (let i = 0; i < 200; i++) {
      const n = randomInt(10, 5);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(10);
    }
  });

  it('supports negative ranges spanning zero', () => {
    let sawNeg = false;
    let sawPos = false;
    for (let i = 0; i < 500; i++) {
      const n = randomInt(-5, 5);
      expect(n).toBeGreaterThanOrEqual(-5);
      expect(n).toBeLessThanOrEqual(5);
      if (n < 0) sawNeg = true;
      if (n > 0) sawPos = true;
    }
    expect(sawNeg).toBe(true);
    expect(sawPos).toBe(true);
  });

  it('rounds fractional bounds inward (ceil min, floor max)', () => {
    // lo = ceil(1.4) = 2, hi = floor(5.9) = 5
    for (let i = 0; i < 200; i++) {
      const n = randomInt(1.4, 5.9);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  it('can reach both endpoints of the range', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      seen.add(randomInt(0, 2));
    }
    expect(seen.has(0)).toBe(true);
    expect(seen.has(2)).toBe(true);
  });
});

describe('randomFloat', () => {
  it('returns a value within [min, max)', () => {
    for (let i = 0; i < 200; i++) {
      const v = randomFloat(2, 8);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThan(8);
    }
  });

  it('returns exactly min when min === max', () => {
    expect(randomFloat(3.5, 3.5)).toBe(3.5);
  });

  it('supports negative ranges', () => {
    for (let i = 0; i < 200; i++) {
      const v = randomFloat(-10, -1);
      expect(v).toBeGreaterThanOrEqual(-10);
      expect(v).toBeLessThan(-1);
    }
  });
});

describe('randomFromAlphabet', () => {
  it('produces a string of the requested length', () => {
    expect(randomFromAlphabet(20, 'abc')).toHaveLength(20);
  });

  it('returns an empty string for length 0', () => {
    expect(randomFromAlphabet(0, 'abc')).toBe('');
  });

  it('only uses characters from the alphabet', () => {
    const out = randomFromAlphabet(500, 'XY');
    expect(out).toMatch(/^[XY]{500}$/);
  });

  it('produces a constant string from a single-char alphabet', () => {
    expect(randomFromAlphabet(5, 'Z')).toBe('ZZZZZ');
  });

  it('handles unicode/emoji alphabets by code unit', () => {
    // 'é' and 'ü' are single code units; result length tracks the loop count.
    const out = randomFromAlphabet(10, 'éü');
    expect(out).toHaveLength(10);
    expect(out).toMatch(/^[éü]{10}$/);
  });
});

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

  it('defaults to integer output when no options are given', () => {
    const lines = buildRandom({}).split('\n');
    // default count = 5, default min/max = 1/100
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      const n = parseInt(line, 10);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(100);
    }
  });

  it('falls back to integer for an unknown type', () => {
    const lines = buildRandom({ type: 'wat', min: '1', max: '3', count: '8' }).split('\n');
    expect(lines).toHaveLength(8);
    for (const line of lines) {
      const n = parseInt(line, 10);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it('clamps count to the maximum of 1000', () => {
    const lines = buildRandom({ type: 'integer', count: '5000' }).split('\n');
    expect(lines).toHaveLength(1000);
  });

  it('clamps invalid (zero) count back to the default of 5', () => {
    // parseInt('0') || 5 === 5
    const lines = buildRandom({ type: 'integer', count: '0' }).split('\n');
    expect(lines).toHaveLength(5);
  });

  it('falls back to default count when count is non-numeric', () => {
    const lines = buildRandom({ type: 'integer', count: 'abc' }).split('\n');
    expect(lines).toHaveLength(5);
  });

  it('clamps length to the maximum of 4096 for hex', () => {
    expect(buildRandom({ type: 'hex', length: '9000', count: '1' })).toHaveLength(4096);
  });

  it('falls back to default length 16 when length is zero', () => {
    // parseInt('0') || 16 === 16
    expect(buildRandom({ type: 'hex', length: '0', count: '1' })).toHaveLength(16);
  });

  it('falls back to default length 16 when length is non-numeric', () => {
    expect(buildRandom({ type: 'alphanumeric', length: 'xyz', count: '1' })).toHaveLength(16);
  });

  it('treats non-numeric min/max as 0 for integers', () => {
    // Number('abc') || 0 === 0 for both -> range [0, 0] -> always 0
    const lines = buildRandom({ type: 'integer', min: 'abc', max: 'def', count: '4' }).split('\n');
    expect(lines).toHaveLength(4);
    for (const line of lines) {
      expect(line).toBe('0');
    }
  });

  it('supports negative integer ranges', () => {
    const lines = buildRandom({ type: 'integer', min: '-5', max: '-1', count: '20' }).split('\n');
    for (const line of lines) {
      const n = parseInt(line, 10);
      expect(n).toBeGreaterThanOrEqual(-5);
      expect(n).toBeLessThanOrEqual(-1);
    }
  });

  it('handles reversed min/max for integers', () => {
    const lines = buildRandom({ type: 'integer', min: '20', max: '10', count: '20' }).split('\n');
    for (const line of lines) {
      const n = parseInt(line, 10);
      expect(n).toBeGreaterThanOrEqual(10);
      expect(n).toBeLessThanOrEqual(20);
    }
  });

  it('produces every line as a single integer (count of 1)', () => {
    const out = buildRandom({ type: 'integer', min: '42', max: '42', count: '1' });
    expect(out).toBe('42');
    expect(out).not.toContain('\n');
  });

  it('produces negative floats with proper formatting', () => {
    const lines = buildRandom({ type: 'float', min: '-2', max: '-1', count: '5' }).split('\n');
    for (const line of lines) {
      expect(line).toMatch(/^-\d+\.\d{4}$/);
      const v = Number(line);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThan(-1);
    }
  });

  it('is deterministic in structure (count/length) across runs', () => {
    const a = buildRandom({ type: 'hex', length: '10', count: '7' }).split('\n');
    const b = buildRandom({ type: 'hex', length: '10', count: '7' }).split('\n');
    expect(a).toHaveLength(7);
    expect(b).toHaveLength(7);
    for (const line of [...a, ...b]) {
      expect(line).toHaveLength(10);
    }
  });
});

describe('RANDOM_OPTIONS', () => {
  it('exposes a type select with all four generator choices', () => {
    const typeOpt = RANDOM_OPTIONS.find((o) => o.key === 'type');
    expect(typeOpt).toBeDefined();
    expect(typeOpt?.type).toBe('select');
    const values = typeOpt?.choices?.map((c) => c.value);
    expect(values).toEqual(['integer', 'float', 'hex', 'alphanumeric']);
    expect(typeOpt?.default).toBe('integer');
  });

  it('exposes min, max, length and count text options', () => {
    const keys = RANDOM_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(['type', 'min', 'max', 'length', 'count']);
  });
});

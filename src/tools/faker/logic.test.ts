import { describe, it, expect, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { fakeValue, generateFake, FAKE_TYPES } from './logic';

// Seed faker before each test so any value-dependent assertions are deterministic.
beforeEach(() => {
  faker.seed(12345);
});

describe('FAKE_TYPES', () => {
  it('exposes the expected list of types', () => {
    expect(FAKE_TYPES).toEqual([
      'fullName', 'firstName', 'email', 'username', 'url', 'phone',
      'address', 'city', 'country', 'company', 'jobTitle',
      'uuid', 'sentence', 'paragraph', 'date', 'number', 'boolean', 'color',
    ]);
  });

  it('has no duplicate entries', () => {
    expect(new Set(FAKE_TYPES).size).toBe(FAKE_TYPES.length);
  });
});

describe('fakeValue - happy paths for every type', () => {
  it('fullName returns a non-empty string with a space (first + last)', () => {
    const v = fakeValue(faker, 'fullName');
    expect(typeof v).toBe('string');
    expect(v.length).toBeGreaterThan(0);
    expect(v).toContain(' ');
  });

  it('firstName returns a non-empty string', () => {
    const v = fakeValue(faker, 'firstName');
    expect(v.length).toBeGreaterThan(0);
  });

  it('email contains an @ and a dot', () => {
    const v = fakeValue(faker, 'email');
    expect(v).toContain('@');
    expect(v).toMatch(/.+@.+\..+/);
  });

  it('username is a non-empty string without spaces', () => {
    const v = fakeValue(faker, 'username');
    expect(v.length).toBeGreaterThan(0);
    expect(v).not.toContain(' ');
  });

  it('url starts with http', () => {
    const v = fakeValue(faker, 'url');
    expect(v).toMatch(/^https?:\/\//);
  });

  it('phone returns a non-empty string', () => {
    const v = fakeValue(faker, 'phone');
    expect(v.length).toBeGreaterThan(0);
  });

  it('address returns a non-empty street address', () => {
    const v = fakeValue(faker, 'address');
    expect(v.length).toBeGreaterThan(0);
  });

  it('city returns a non-empty string', () => {
    expect(fakeValue(faker, 'city').length).toBeGreaterThan(0);
  });

  it('country returns a non-empty string', () => {
    expect(fakeValue(faker, 'country').length).toBeGreaterThan(0);
  });

  it('company returns a non-empty string', () => {
    expect(fakeValue(faker, 'company').length).toBeGreaterThan(0);
  });

  it('jobTitle returns a non-empty string', () => {
    expect(fakeValue(faker, 'jobTitle').length).toBeGreaterThan(0);
  });

  it('uuid matches the v4 uuid shape', () => {
    expect(fakeValue(faker, 'uuid')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('sentence ends with a period', () => {
    const v = fakeValue(faker, 'sentence');
    expect(v.length).toBeGreaterThan(0);
    expect(v.endsWith('.')).toBe(true);
  });

  it('paragraph is longer than a single sentence on average', () => {
    const v = fakeValue(faker, 'paragraph');
    expect(v.length).toBeGreaterThan(0);
    expect(v).toContain('.');
  });

  it('date returns a valid ISO-8601 string in the past', () => {
    const v = fakeValue(faker, 'date');
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(v).getTime()).toBeLessThan(Date.now());
    expect(Number.isNaN(new Date(v).getTime())).toBe(false);
  });

  it('number returns an integer string within [0, 100000]', () => {
    const v = fakeValue(faker, 'number');
    expect(v).toMatch(/^\d+$/);
    const n = Number(v);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(100000);
    expect(Number.isInteger(n)).toBe(true);
  });

  it('boolean returns the string "true" or "false"', () => {
    const v = fakeValue(faker, 'boolean');
    expect(['true', 'false']).toContain(v);
  });

  it('color returns a hex color string (faker.color.rgb default format)', () => {
    const v = fakeValue(faker, 'color');
    expect(v).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('fakeValue - every declared type produces a non-empty string', () => {
  for (const type of FAKE_TYPES) {
    it(`type "${type}" yields a non-empty string`, () => {
      const v = fakeValue(faker, type);
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    });
  }
});

describe('fakeValue - default / unknown type branch', () => {
  it('falls back to fullName for an unknown type', () => {
    // Both should be drawn from the same generator at the same seed position.
    faker.seed(777);
    const unknown = fakeValue(faker, 'definitely-not-a-type');
    faker.seed(777);
    const full = fakeValue(faker, 'fullName');
    expect(unknown).toBe(full);
  });

  it('empty string type falls back to fullName (contains a space)', () => {
    const v = fakeValue(faker, '');
    expect(v.length).toBeGreaterThan(0);
    expect(v).toContain(' ');
  });

  it('whitespace-only type falls back to fullName', () => {
    faker.seed(42);
    const ws = fakeValue(faker, '   ');
    faker.seed(42);
    const full = fakeValue(faker, 'fullName');
    expect(ws).toBe(full);
  });

  it('a type differing only by case does not match (case-sensitive switch)', () => {
    // 'Email' is not 'email', so it hits the default (fullName) branch.
    faker.seed(99);
    const cased = fakeValue(faker, 'Email');
    faker.seed(99);
    const full = fakeValue(faker, 'fullName');
    expect(cased).toBe(full);
  });

  it('unicode/emoji type string falls back to fullName', () => {
    const v = fakeValue(faker, '😀-тип-😀');
    expect(v).toContain(' ');
  });
});

describe('fakeValue - determinism with seed', () => {
  it('same seed + same type produces identical output', () => {
    faker.seed(2024);
    const a = fakeValue(faker, 'email');
    faker.seed(2024);
    const b = fakeValue(faker, 'email');
    expect(a).toBe(b);
  });

  it('different seeds generally produce different output', () => {
    faker.seed(1);
    const a = fakeValue(faker, 'uuid');
    faker.seed(2);
    const b = fakeValue(faker, 'uuid');
    expect(a).not.toBe(b);
  });
});

describe('generateFake', () => {
  it('produces the requested number of lines', async () => {
    const out = await generateFake('fullName', 5);
    expect(out.split('\n')).toHaveLength(5);
  });

  it('count of 1 yields a single line with no newline', async () => {
    const out = await generateFake('email', 1);
    expect(out.split('\n')).toHaveLength(1);
    expect(out).not.toContain('\n');
    expect(out).toContain('@');
  });

  it('count of 0 yields an empty string', async () => {
    const out = await generateFake('uuid', 0);
    expect(out).toBe('');
    // join on an empty array is the empty string -> single (empty) element when split.
    expect(out.split('\n')).toEqual(['']);
  });

  it('large count produces many lines efficiently', async () => {
    const out = await generateFake('number', 1000);
    const lines = out.split('\n');
    expect(lines).toHaveLength(1000);
    expect(lines.every((l) => /^\d+$/.test(l))).toBe(true);
  });

  it('unknown type falls back to fullName for each line', async () => {
    const out = await generateFake('no-such-type', 3);
    const lines = out.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines.every((l) => l.includes(' '))).toBe(true);
  });

  it('each generated uuid line is unique (no accidental repetition)', async () => {
    const out = await generateFake('uuid', 50);
    const lines = out.split('\n');
    expect(new Set(lines).size).toBe(50);
  });

  it('every line for "boolean" type is true or false', async () => {
    const out = await generateFake('boolean', 20);
    const lines = out.split('\n');
    expect(lines.every((l) => l === 'true' || l === 'false')).toBe(true);
  });

  it('negative count yields an empty string (Array.from clamps length to 0)', async () => {
    const out = await generateFake('email', -5);
    expect(out).toBe('');
  });
});

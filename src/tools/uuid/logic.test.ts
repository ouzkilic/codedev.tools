import { describe, it, expect } from 'vitest';
import { UUID_OPTIONS, uuidV7, generateUuids } from './logic';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('UUID_OPTIONS metadata', () => {
  it('exposes a version select with v4 and v7 choices, defaulting to v4', () => {
    const version = UUID_OPTIONS.find((o) => o.key === 'version');
    expect(version?.type).toBe('select');
    expect(version?.default).toBe('v4');
    expect(version?.choices?.map((c) => c.value)).toEqual(['v4', 'v7']);
  });
  it('exposes a count text option defaulting to 5', () => {
    const count = UUID_OPTIONS.find((o) => o.key === 'count');
    expect(count?.type).toBe('text');
    expect(count?.default).toBe('5');
  });
});

describe('uuidV7', () => {
  it('produces a valid v7 UUID for a fixed timestamp', () => {
    expect(uuidV7(1700000000000)).toMatch(V7);
  });
  it('encodes the 48-bit big-endian timestamp in the first 12 hex chars', () => {
    // 1700000000000 === 0x18BCFE56800 → 48-bit big-endian "018bcfe56800"
    const id = uuidV7(1700000000000);
    expect(id.slice(0, 13)).toBe('018bcfe5-6800');
  });
  it('encodes a zero timestamp as all-zero leading bytes', () => {
    const id = uuidV7(0);
    expect(id.slice(0, 13)).toBe('00000000-0000');
    expect(id).toMatch(V7);
  });
  it('encodes the maximum 48-bit timestamp', () => {
    // 2^48 - 1 === 0xFFFFFFFFFFFF
    const id = uuidV7(0xffffffffffff);
    expect(id.slice(0, 13)).toBe('ffffffff-ffff');
    expect(id).toMatch(V7);
  });
  it('always sets the version nibble to 7 and the variant nibble to 8-b', () => {
    for (let i = 0; i < 50; i++) {
      const id = uuidV7(1700000000000);
      expect(id[14]).toBe('7');
      expect('89ab').toContain(id[19]);
    }
  });
  it('produces unique values for the same timestamp (random tail)', () => {
    const ids = Array.from({ length: 100 }, () => uuidV7(1700000000000));
    expect(new Set(ids).size).toBe(100);
  });
  it('orders lexicographically by ascending timestamp', () => {
    const earlier = uuidV7(1000000000000);
    const later = uuidV7(2000000000000);
    expect(earlier < later).toBe(true);
  });
});

describe('generateUuids', () => {
  it('produces valid v7 UUIDs (time-ordered)', () => {
    for (const id of generateUuids({ version: 'v7', count: '5' }, 1700000000000).split('\n')) {
      expect(id).toMatch(V7);
    }
  });
  it('generates the requested count', () => {
    expect(generateUuids({ count: '3' }).split('\n')).toHaveLength(3);
  });
  it('produces valid v4 UUIDs', () => {
    for (const id of generateUuids({ count: '10' }).split('\n')) {
      expect(id).toMatch(V4);
    }
  });
  it('defaults to v4 when no version is given', () => {
    expect(generateUuids({ count: '1' }).split('\n')[0]).toMatch(V4);
  });
  it('treats any version other than v7 as v4', () => {
    expect(generateUuids({ version: 'v9', count: '1' }).split('\n')[0]).toMatch(V4);
  });
  it('produces unique values', () => {
    const ids = generateUuids({ count: '50' }).split('\n');
    expect(new Set(ids).size).toBe(50);
  });
  it('defaults to one for invalid count and clamps the maximum', () => {
    expect(generateUuids({ count: 'x' }).split('\n')).toHaveLength(1);
    expect(generateUuids({ count: '99999' }).split('\n')).toHaveLength(1000);
  });
  it('clamps zero and negative counts up to one', () => {
    expect(generateUuids({ count: '0' }).split('\n')).toHaveLength(1);
    expect(generateUuids({ count: '-5' }).split('\n')).toHaveLength(1);
  });
  it('defaults to one when count is missing entirely', () => {
    expect(generateUuids({}).split('\n')).toHaveLength(1);
  });
  it('parses leading-numeric and decimal strings via parseInt', () => {
    expect(generateUuids({ count: '4abc' }).split('\n')).toHaveLength(4);
    expect(generateUuids({ count: '3.9' }).split('\n')).toHaveLength(3);
  });
  it('clamps exactly at the 1000 boundary', () => {
    expect(generateUuids({ count: '1000' }).split('\n')).toHaveLength(1000);
    expect(generateUuids({ count: '1001' }).split('\n')).toHaveLength(1000);
  });
  it('joins multiple UUIDs with newlines only (no trailing newline)', () => {
    const out = generateUuids({ count: '3' });
    expect(out.split('\n')).toHaveLength(3);
    expect(out.endsWith('\n')).toBe(false);
  });
  it('honors the provided timestamp for every v7 UUID in a batch', () => {
    const ids = generateUuids({ version: 'v7', count: '4' }, 1700000000000).split('\n');
    for (const id of ids) {
      expect(id.slice(0, 13)).toBe('018bcfe5-6800');
    }
  });
});

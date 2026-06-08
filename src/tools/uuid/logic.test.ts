import { describe, it, expect } from 'vitest';
import { generateUuids } from './logic';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuid', () => {
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
  it('produces unique values', () => {
    const ids = generateUuids({ count: '50' }).split('\n');
    expect(new Set(ids).size).toBe(50);
  });
  it('defaults to one for invalid count and clamps the maximum', () => {
    expect(generateUuids({ count: 'x' }).split('\n')).toHaveLength(1);
    expect(generateUuids({ count: '99999' }).split('\n')).toHaveLength(1000);
  });
});

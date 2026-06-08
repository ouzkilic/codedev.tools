import { describe, it, expect } from 'vitest';
import { generateUlid, generateUlids } from './logic';

const VALID = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

describe('ulid', () => {
  it('produces a 26-char Crockford base32 id', () => {
    expect(generateUlid(1700000000000)).toMatch(VALID);
  });
  it('shares the timestamp prefix for the same time', () => {
    const a = generateUlid(1700000000000);
    const b = generateUlid(1700000000000);
    expect(a.slice(0, 10)).toBe(b.slice(0, 10));
  });
  it('differs in the random suffix', () => {
    const a = generateUlid(1700000000000);
    const b = generateUlid(1700000000000);
    expect(a.slice(10)).not.toBe(b.slice(10));
  });
  it('generates the requested count', () => {
    expect(generateUlids({ count: '4' }, 1700000000000).split('\n')).toHaveLength(4);
  });
});

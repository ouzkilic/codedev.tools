import { describe, it, expect } from 'vitest';
import { generateUlid, generateUlids, ULID_OPTIONS } from './logic';

const VALID = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;
const FIXED = 1700000000000;

describe('ULID_OPTIONS', () => {
  it('exposes a single count option with a default of 5', () => {
    expect(ULID_OPTIONS).toHaveLength(1);
    const opt = ULID_OPTIONS[0];
    expect(opt.key).toBe('count');
    expect(opt.type).toBe('text');
    expect(opt.default).toBe('5');
  });
});

describe('generateUlid', () => {
  it('produces a 26-char Crockford base32 id', () => {
    expect(generateUlid(FIXED)).toMatch(VALID);
  });

  it('never includes the excluded Crockford letters I, L, O, U', () => {
    const id = generateUlid(FIXED);
    expect(id).not.toMatch(/[ILOU]/);
  });

  it('shares the timestamp prefix for the same time', () => {
    const a = generateUlid(FIXED);
    const b = generateUlid(FIXED);
    expect(a.slice(0, 10)).toBe(b.slice(0, 10));
  });

  it('differs in the random suffix', () => {
    const a = generateUlid(FIXED);
    const b = generateUlid(FIXED);
    expect(a.slice(10)).not.toBe(b.slice(10));
  });

  it('encodes time=0 as ten leading zeros', () => {
    expect(generateUlid(0).slice(0, 10)).toBe('0000000000');
  });

  it('uses an ascending time prefix for an increasing timestamp', () => {
    // Crockford base32 sorts lexicographically in the same order as the value.
    const earlier = generateUlid(FIXED).slice(0, 10);
    const later = generateUlid(FIXED + 32).slice(0, 10);
    expect(later > earlier).toBe(true);
  });

  it('changes the last time char by one step for a +1ms tick', () => {
    // ENCODING[ (FIXED) % 32 ] vs ENCODING[ (FIXED+1) % 32 ]
    const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    const a = generateUlid(FIXED).slice(9, 10);
    const b = generateUlid(FIXED + 1).slice(9, 10);
    expect(a).toBe(ENCODING[FIXED % 32]);
    expect(b).toBe(ENCODING[(FIXED + 1) % 32]);
  });

  it('produces unique ids across many calls (random suffix entropy)', () => {
    const ids = new Set(Array.from({ length: 200 }, () => generateUlid(FIXED)));
    expect(ids.size).toBe(200);
  });

  it('handles a large timestamp without overflowing the prefix length', () => {
    expect(generateUlid(Number.MAX_SAFE_INTEGER)).toMatch(VALID);
  });
});

describe('generateUlids', () => {
  it('generates the requested count', () => {
    expect(generateUlids({ count: '4' }, FIXED).split('\n')).toHaveLength(4);
  });

  it('joins ids with a single newline and no trailing newline', () => {
    const out = generateUlids({ count: '3' }, FIXED);
    expect(out.split('\n')).toHaveLength(3);
    expect(out.endsWith('\n')).toBe(false);
  });

  it('each generated id is a valid ULID', () => {
    for (const id of generateUlids({ count: '5' }, FIXED).split('\n')) {
      expect(id).toMatch(VALID);
    }
  });

  it('defaults to one id when count is missing', () => {
    expect(generateUlids({}, FIXED).split('\n')).toHaveLength(1);
  });

  it('falls back to one id for a non-numeric count', () => {
    expect(generateUlids({ count: 'abc' }, FIXED).split('\n')).toHaveLength(1);
  });

  it('falls back to one id for a count of zero', () => {
    expect(generateUlids({ count: '0' }, FIXED).split('\n')).toHaveLength(1);
  });

  it('clamps a negative count up to one', () => {
    expect(generateUlids({ count: '-5' }, FIXED).split('\n')).toHaveLength(1);
  });

  it('clamps counts above the maximum to 1000', () => {
    expect(generateUlids({ count: '2000' }, FIXED).split('\n')).toHaveLength(1000);
  });

  it('truncates a fractional count via parseInt', () => {
    expect(generateUlids({ count: '3.9' }, FIXED).split('\n')).toHaveLength(3);
  });

  it('parses a leading-number string for count', () => {
    expect(generateUlids({ count: '7xyz' }, FIXED).split('\n')).toHaveLength(7);
  });

  it('shares the same time prefix across all ids generated at one timestamp', () => {
    const ids = generateUlids({ count: '6' }, FIXED).split('\n');
    const prefix = ids[0].slice(0, 10);
    for (const id of ids) expect(id.slice(0, 10)).toBe(prefix);
  });
});

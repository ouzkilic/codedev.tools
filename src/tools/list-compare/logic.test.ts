import { describe, it, expect } from 'vitest';
import { listCompareLogic } from './logic';

// Raw transform helper: returns the exact joined string output.
const raw = (a: string, b: string, op?: string) =>
  listCompareLogic.transform(a, { options: op === undefined ? {} : { op }, secondary: b });

// Convenience helper: split + drop blanks into an array.
const run = (a: string, b: string, op?: string) => raw(a, b, op).split('\n').filter(Boolean);

const A = 'a\nb\nc';
const B = 'b\nc\nd';

describe('listCompare — existing behaviour', () => {
  it('computes the intersection', () => {
    expect(run(A, B, 'intersection')).toEqual(['b', 'c']);
  });
  it('computes the union', () => {
    expect(run(A, B, 'union')).toEqual(['a', 'b', 'c', 'd']);
  });
  it('computes items only in A', () => {
    expect(run(A, B, 'a-only')).toEqual(['a']);
  });
  it('computes items only in B', () => {
    expect(run(A, B, 'b-only')).toEqual(['d']);
  });
  it('computes the symmetric difference', () => {
    expect(run(A, B, 'symmetric')).toEqual(['a', 'd']);
  });
  it('deduplicates and ignores blank lines', () => {
    expect(run('a\na\n\nb', 'a', 'intersection')).toEqual(['a']);
  });
});

describe('listCompare — metadata / shape', () => {
  it('exposes a transform function', () => {
    expect(typeof listCompareLogic.transform).toBe('function');
  });
  it('declares a secondary input labelled "List B"', () => {
    expect(listCompareLogic.secondary?.label).toBe('List B');
  });
  it('declares a single "op" select option defaulting to intersection', () => {
    const opt = listCompareLogic.options?.find((o) => o.key === 'op');
    expect(opt?.type).toBe('select');
    expect(opt?.default).toBe('intersection');
  });
  it('offers exactly the five documented operation choices', () => {
    const opt = listCompareLogic.options?.find((o) => o.key === 'op');
    const values = (opt?.choices ?? []).map((c) => c.value).sort();
    expect(values).toEqual(['a-only', 'b-only', 'intersection', 'symmetric', 'union']);
  });
});

describe('listCompare — default operation', () => {
  it('falls back to intersection when op is omitted', () => {
    expect(run(A, B)).toEqual(['b', 'c']);
  });
  it('falls back to intersection for an unknown op value', () => {
    expect(run(A, B, 'nonsense-op')).toEqual(['b', 'c']);
  });
});

describe('listCompare — order preservation', () => {
  it('union keeps A order first, then new B items in B order', () => {
    // A: x, z ; B: z, y, x  ->  union dedup preserving first occurrence: x, z, y
    expect(run('x\nz', 'z\ny\nx', 'union')).toEqual(['x', 'z', 'y']);
  });
  it('intersection keeps the order of A', () => {
    // A order is c, a, b; filtered to those in B (a, b, c) -> c, a, b
    expect(run('c\na\nb', 'a\nb\nc', 'intersection')).toEqual(['c', 'a', 'b']);
  });
  it('symmetric lists A-only items before B-only items', () => {
    // A only: a ; B only: d  -> a then d
    expect(run(A, B, 'symmetric')).toEqual(['a', 'd']);
  });
});

describe('listCompare — empty / whitespace inputs', () => {
  it('returns empty string when both inputs are empty', () => {
    expect(raw('', '', 'union')).toBe('');
  });
  it('treats whitespace-only lines as blank (trimmed then filtered)', () => {
    expect(run('   \n\t\n  ', 'a', 'union')).toEqual(['a']);
  });
  it('union of empty A is just B (deduped)', () => {
    expect(run('', 'b\nb\nc', 'union')).toEqual(['b', 'c']);
  });
  it('intersection with empty B is empty', () => {
    expect(run(A, '', 'intersection')).toEqual([]);
  });
  it('a-only with empty B returns all of A deduped', () => {
    expect(run('a\na\nb', '', 'a-only')).toEqual(['a', 'b']);
  });
  it('b-only with empty A returns all of B deduped', () => {
    expect(run('', 'd\nd\ne', 'b-only')).toEqual(['d', 'e']);
  });
});

describe('listCompare — trimming and separators', () => {
  it('trims leading/trailing whitespace so " a " matches "a"', () => {
    expect(run('  a  \n b ', 'a\nb', 'intersection')).toEqual(['a', 'b']);
  });
  it('ignores leading and trailing blank lines', () => {
    expect(run('\n\na\nb\n\n', 'a', 'intersection')).toEqual(['a']);
  });
  it('does not split on commas or spaces inside a line (line-based only)', () => {
    // "a b" is a single token, not present in B {"a","b"}
    expect(run('a b', 'a\nb', 'intersection')).toEqual([]);
  });
});

describe('listCompare — unicode / emoji / special chars', () => {
  it('compares emoji items by exact codepoint sequence', () => {
    expect(run('🚀\n🌙', '🌙\n⭐', 'intersection')).toEqual(['🌙']);
  });
  it('treats accented characters as distinct from ASCII', () => {
    expect(run('café', 'cafe', 'intersection')).toEqual([]);
  });
  it('handles items containing special punctuation', () => {
    expect(run('a.b\nc/d', 'c/d\ne', 'intersection')).toEqual(['c/d']);
  });
});

describe('listCompare — numeric-looking items', () => {
  it('compares numbers as strings, distinguishing "0" from "00"', () => {
    expect(run('0\n00\n-5', '0\n-5', 'intersection')).toEqual(['0', '-5']);
  });
  it('keeps "1" and "1.0" as distinct tokens', () => {
    expect(run('1\n1.0', '1', 'a-only')).toEqual(['1.0']);
  });
});

describe('listCompare — large input & determinism', () => {
  const big = (offset: number, count: number) =>
    Array.from({ length: count }, (_, i) => `item${i + offset}`).join('\n');

  it('handles large lists correctly (intersection of overlapping ranges)', () => {
    // A: item0..item9999 ; B: item5000..item14999 ; intersection item5000..item9999
    const res = run(big(0, 10000), big(5000, 10000), 'intersection');
    expect(res).toHaveLength(5000);
    expect(res[0]).toBe('item5000');
    expect(res[res.length - 1]).toBe('item9999');
  });

  it('is deterministic across repeated calls', () => {
    expect(raw(A, B, 'symmetric')).toBe(raw(A, B, 'symmetric'));
  });
});

describe('listCompare — set-theory identities', () => {
  const C = 'a\nb\nc\nx';
  const D = 'b\nx\ny\nz';

  it('union length == aOnly + bOnly + intersection', () => {
    const u = run(C, D, 'union').length;
    const aOnly = run(C, D, 'a-only').length;
    const bOnly = run(C, D, 'b-only').length;
    const inter = run(C, D, 'intersection').length;
    expect(u).toBe(aOnly + bOnly + inter);
  });

  it('symmetric == a-only concatenated with b-only', () => {
    const sym = run(C, D, 'symmetric');
    const expected = [...run(C, D, 'a-only'), ...run(C, D, 'b-only')];
    expect(sym).toEqual(expected);
  });

  it('intersection and symmetric difference are disjoint', () => {
    const inter = new Set(run(C, D, 'intersection'));
    const sym = run(C, D, 'symmetric');
    expect(sym.every((x) => !inter.has(x))).toBe(true);
  });

  it('a-only items never appear in B', () => {
    const aOnly = run(C, D, 'a-only');
    const bItems = new Set('b\nx\ny\nz'.split('\n'));
    expect(aOnly.every((x) => !bItems.has(x))).toBe(true);
  });
});

describe('listCompare — equal-set behaviour', () => {
  it('intersection of identical sets returns the deduped set', () => {
    expect(run('a\nb\na', 'b\na', 'intersection')).toEqual(['a', 'b']);
  });
  it('symmetric difference of identical sets is empty', () => {
    expect(run('a\nb', 'b\na', 'symmetric')).toEqual([]);
  });
  it('a-only of identical sets is empty', () => {
    expect(run('a\nb', 'a\nb', 'a-only')).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { listCompareLogic } from './logic';

const run = (a: string, b: string, op: string) =>
  listCompareLogic.transform(a, { options: { op }, secondary: b }).split('\n').filter(Boolean);

const A = 'a\nb\nc';
const B = 'b\nc\nd';

describe('listCompare', () => {
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

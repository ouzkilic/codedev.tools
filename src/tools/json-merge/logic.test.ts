import { describe, it, expect } from 'vitest';
import { jsonMergeLogic } from './logic';

const merge = (a: string, b: string) =>
  JSON.parse(jsonMergeLogic.transform(a, { options: {}, secondary: b }));

describe('jsonMerge', () => {
  it('combines disjoint keys', () => {
    expect(merge('{"a":1}', '{"b":2}')).toEqual({ a: 1, b: 2 });
  });
  it('merges nested objects recursively', () => {
    expect(merge('{"a":{"x":1}}', '{"a":{"y":2}}')).toEqual({ a: { x: 1, y: 2 } });
  });
  it('lets source override target for conflicting primitives', () => {
    expect(merge('{"a":1}', '{"a":2}')).toEqual({ a: 2 });
  });
  it('replaces arrays rather than concatenating them', () => {
    expect(merge('{"a":[1,2]}', '{"a":[3]}')).toEqual({ a: [3] });
  });
  it('returns the target unchanged when source is empty', () => {
    expect(merge('{"a":1}', '')).toEqual({ a: 1 });
  });
  it('throws on invalid source JSON', () => {
    expect(() => jsonMergeLogic.transform('{"a":1}', { options: {}, secondary: '{bad}' })).toThrow();
  });
});

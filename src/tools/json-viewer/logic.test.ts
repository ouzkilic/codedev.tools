import { describe, it, expect } from 'vitest';
import { isContainer, entriesOf, summarize, formatLeaf } from './logic';
import type { JsonValue } from './logic';

describe('isContainer', () => {
  it('detects containers vs leaves', () => {
    expect(isContainer({})).toBe(true);
    expect(isContainer([])).toBe(true);
    expect(isContainer(null)).toBe(false);
    expect(isContainer('x')).toBe(false);
  });
  it('treats non-empty objects and arrays as containers', () => {
    expect(isContainer({ a: 1 })).toBe(true);
    expect(isContainer([1, 2, 3])).toBe(true);
    expect(isContainer(['nested', { k: 'v' }])).toBe(true);
  });
  it('treats every primitive leaf as non-container', () => {
    expect(isContainer(0)).toBe(false);
    expect(isContainer(42)).toBe(false);
    expect(isContainer(-1)).toBe(false);
    expect(isContainer('')).toBe(false);
    expect(isContainer(false)).toBe(false);
    expect(isContainer(true)).toBe(false);
  });
  it('treats null as a leaf even though typeof null is object', () => {
    // null !== null is false, so the first clause short-circuits to false
    expect(isContainer(null)).toBe(false);
  });
});

describe('entriesOf', () => {
  it('lists object entries preserving insertion order', () => {
    expect(entriesOf({ a: 1, b: 2 })).toEqual([['a', 1], ['b', 2]]);
  });
  it('lists array entries with stringified index keys', () => {
    expect(entriesOf(['x', 'y'])).toEqual([['0', 'x'], ['1', 'y']]);
  });
  it('returns an empty list for empty containers', () => {
    expect(entriesOf({})).toEqual([]);
    expect(entriesOf([])).toEqual([]);
  });
  it('returns an empty list for primitive leaves', () => {
    expect(entriesOf(null)).toEqual([]);
    expect(entriesOf('hello')).toEqual([]);
    expect(entriesOf(123)).toEqual([]);
    expect(entriesOf(true)).toEqual([]);
  });
  it('keeps nested values intact without recursing', () => {
    const nested: JsonValue = { a: { b: 1 }, c: [2, 3] };
    expect(entriesOf(nested)).toEqual([['a', { b: 1 }], ['c', [2, 3]]]);
  });
  it('indexes long arrays sequentially as strings', () => {
    const arr: JsonValue = [10, 20, 30, 40];
    expect(entriesOf(arr)).toEqual([
      ['0', 10],
      ['1', 20],
      ['2', 30],
      ['3', 40],
    ]);
  });
  it('handles unicode and special-character object keys', () => {
    const obj: JsonValue = { 'café': 1, '🚀': 2, 'a b': 3 };
    expect(entriesOf(obj)).toEqual([['café', 1], ['🚀', 2], ['a b', 3]]);
  });
  it('preserves null and boolean leaf values inside an object', () => {
    expect(entriesOf({ x: null, y: false })).toEqual([['x', null], ['y', false]]);
  });
});

describe('summarize', () => {
  it('summarizes container sizes', () => {
    expect(summarize({ a: 1, b: 2 })).toBe('{2}');
    expect(summarize([1, 2, 3])).toBe('[3]');
  });
  it('reports zero for empty containers', () => {
    expect(summarize({})).toBe('{0}');
    expect(summarize([])).toBe('[0]');
  });
  it('counts only top-level keys, not nested ones', () => {
    expect(summarize({ a: { b: 1, c: 2 } })).toBe('{1}');
    expect(summarize([[1, 2], [3, 4], [5]])).toBe('[3]');
  });
  it('returns an empty string for primitive leaves', () => {
    expect(summarize(null)).toBe('');
    expect(summarize('text')).toBe('');
    expect(summarize(7)).toBe('');
    expect(summarize(true)).toBe('');
  });
  it('prefers the array branch for arrays (length, not key count)', () => {
    // sparse-like dense array: length drives the summary
    expect(summarize([undefined as unknown as JsonValue, 1])).toBe('[2]');
  });
});

describe('formatLeaf', () => {
  it('quotes string leaves but not other primitives', () => {
    expect(formatLeaf('hi')).toBe('"hi"');
    expect(formatLeaf(42)).toBe('42');
    expect(formatLeaf(null)).toBe('null');
    expect(formatLeaf(true)).toBe('true');
  });
  it('escapes special characters inside strings via JSON.stringify', () => {
    expect(formatLeaf('a"b')).toBe('"a\\"b"');
    expect(formatLeaf('line\nbreak')).toBe('"line\\nbreak"');
    expect(formatLeaf('tab\there')).toBe('"tab\\there"');
    expect(formatLeaf('back\\slash')).toBe('"back\\\\slash"');
  });
  it('renders the empty string as a pair of quotes', () => {
    expect(formatLeaf('')).toBe('""');
  });
  it('preserves unicode and emoji in string leaves', () => {
    expect(formatLeaf('café 🚀')).toBe('"café 🚀"');
  });
  it('renders numeric boundaries with String()', () => {
    expect(formatLeaf(0)).toBe('0');
    expect(formatLeaf(-0)).toBe('0');
    expect(formatLeaf(-12.5)).toBe('-12.5');
    expect(formatLeaf(1e21)).toBe('1e+21');
    expect(formatLeaf(Number.MAX_SAFE_INTEGER)).toBe('9007199254740991');
  });
  it('renders false as well as true', () => {
    expect(formatLeaf(false)).toBe('false');
  });
});

describe('integration across helpers', () => {
  it('walks a nested structure using entriesOf + isContainer + leaf/summary', () => {
    const data: JsonValue = { user: { name: 'Ada', tags: ['x', 'y'] }, active: true };
    const top = entriesOf(data);
    expect(top.map(([k]) => k)).toEqual(['user', 'active']);

    const [, userVal] = top[0];
    expect(isContainer(userVal)).toBe(true);
    expect(summarize(userVal)).toBe('{2}');

    const [, activeVal] = top[1];
    expect(isContainer(activeVal)).toBe(false);
    expect(formatLeaf(activeVal)).toBe('true');

    const userEntries = entriesOf(userVal);
    const tags = userEntries.find(([k]) => k === 'tags')?.[1] as JsonValue;
    expect(summarize(tags)).toBe('[2]');
    expect(entriesOf(tags)).toEqual([['0', 'x'], ['1', 'y']]);
  });
});

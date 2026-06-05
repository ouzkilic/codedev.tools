import { describe, it, expect } from 'vitest';
import { isContainer, entriesOf, summarize, formatLeaf } from './logic';

describe('jsonViewer helpers', () => {
  it('detects containers vs leaves', () => {
    expect(isContainer({})).toBe(true);
    expect(isContainer([])).toBe(true);
    expect(isContainer(null)).toBe(false);
    expect(isContainer('x')).toBe(false);
  });
  it('lists object entries', () => {
    expect(entriesOf({ a: 1, b: 2 })).toEqual([['a', 1], ['b', 2]]);
  });
  it('lists array entries with index keys', () => {
    expect(entriesOf(['x', 'y'])).toEqual([['0', 'x'], ['1', 'y']]);
  });
  it('summarizes container sizes', () => {
    expect(summarize({ a: 1, b: 2 })).toBe('{2}');
    expect(summarize([1, 2, 3])).toBe('[3]');
  });
  it('quotes string leaves but not other primitives', () => {
    expect(formatLeaf('hi')).toBe('"hi"');
    expect(formatLeaf(42)).toBe('42');
    expect(formatLeaf(null)).toBe('null');
    expect(formatLeaf(true)).toBe('true');
  });
});

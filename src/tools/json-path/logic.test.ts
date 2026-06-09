import { describe, it, expect } from 'vitest';
import { jsonPathLogic } from './logic';

// Raw transform helper — returns the stringified JSON output as produced by the tool.
const run = (json: string, path?: string) =>
  jsonPathLogic.transform(json, {
    options: path === undefined ? {} : { query: path },
    secondary: '',
  });

// Parsed helper — the common case where output is valid JSON.
const query = (json: string, path: string) => JSON.parse(run(json, path));

const data = '{"items":[{"id":1,"name":"a"},{"id":2,"name":"b"}]}';

const store = JSON.stringify({
  store: {
    book: [
      { author: 'a', price: 5 },
      { author: 'b', price: 15 },
    ],
    bicycle: { color: 'red' },
  },
  nums: [0, -1, 2.5, 1000],
  uni: '😀',
  empty: [],
});

describe('jsonPath — basic selection', () => {
  it('selects a field across array elements', () => {
    expect(query(data, '$.items[*].id')).toEqual([1, 2]);
  });

  it('selects a single nested value (wrapped in array)', () => {
    expect(query(data, '$.items[0].name')).toEqual(['a']);
  });

  it('supports recursive descent', () => {
    expect(query(data, '$..name')).toEqual(['a', 'b']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(query(data, '$.missing')).toEqual([]);
  });

  it('selects the whole document with the root path', () => {
    expect(query(data, '$')).toEqual([JSON.parse(data)]);
  });
});

describe('jsonPath — options / config', () => {
  it('defaults the query to $ when no query option is provided', () => {
    const out = run('{"x":1}');
    expect(JSON.parse(out)).toEqual([{ x: 1 }]);
  });

  it('defaults the query to $ when query option is undefined', () => {
    const out = jsonPathLogic.transform('[1,2]', { options: {}, secondary: '' });
    expect(JSON.parse(out)).toEqual([[1, 2]]);
  });

  it('trims surrounding whitespace from the query', () => {
    expect(query(data, '   $.items[*].id   ')).toEqual([1, 2]);
  });

  it('returns an empty string for an empty query', () => {
    expect(run(store, '')).toBe('');
  });

  it('returns an empty string for a whitespace-only query', () => {
    expect(run(store, '    ')).toBe('');
  });

  it('exposes a single text option with default "$"', () => {
    expect(jsonPathLogic.options).toBeDefined();
    const opt = jsonPathLogic.options?.find((o) => o.key === 'query');
    expect(opt).toMatchObject({ key: 'query', type: 'text', default: '$' });
  });
});

describe('jsonPath — filters, slices and unions', () => {
  it('applies a filter expression', () => {
    expect(query(store, '$.store.book[?(@.price>10)].author')).toEqual(['b']);
  });

  it('supports a tail slice', () => {
    expect(query(store, '$.store.book[-1:].author')).toEqual(['b']);
  });

  it('supports a range slice', () => {
    expect(query(store, '$.nums[0:2]')).toEqual([0, -1]);
  });

  it('supports a stepped slice', () => {
    expect(query(store, '$.nums[::2]')).toEqual([0, 2.5]);
  });

  it('supports a union of indices', () => {
    expect(query(store, '$.nums[0,3]')).toEqual([0, 1000]);
  });

  it('exposes array length via the length property', () => {
    expect(query(store, '$.store.book.length')).toEqual([2]);
  });
});

describe('jsonPath — recursive descent and wildcards', () => {
  it('collects recursive descent of a deep key', () => {
    expect(query(store, '$.store..color')).toEqual(['red']);
  });

  it('collects every price recursively', () => {
    expect(query(store, '$..price')).toEqual([5, 15]);
  });

  it('flattens nested arrays via wildcard + index', () => {
    const nested = JSON.stringify({ nested: [[1, 2], [3, 4]] });
    expect(query(nested, '$.nested[*][0]')).toEqual([1, 3]);
  });
});

describe('jsonPath — value types and boundaries', () => {
  const types = JSON.stringify({ neg: -5, zero: 0, bool: true, nul: null, float: 2.5, big: 1000 });

  it('returns a zero value', () => {
    expect(query(types, '$.zero')).toEqual([0]);
  });

  it('returns a negative value', () => {
    expect(query(types, '$.neg')).toEqual([-5]);
  });

  it('returns a boolean value', () => {
    expect(query(types, '$.bool')).toEqual([true]);
  });

  it('returns a null value', () => {
    expect(query(types, '$.nul')).toEqual([null]);
  });

  it('returns a float value', () => {
    expect(query(types, '$.float')).toEqual([2.5]);
  });

  it('selects from an array root by index', () => {
    expect(query('[7,8,9]', '$[0]')).toEqual([7]);
  });

  it('handles a scalar root document', () => {
    expect(query('42', '$')).toEqual([42]);
  });
});

describe('jsonPath — special keys and unicode', () => {
  const weird = JSON.stringify({ a: { 'b c': 1, '😀': 'emoji', 'x.y': 42 } });

  it('selects a key containing a space via bracket notation', () => {
    expect(query(weird, "$['a']['b c']")).toEqual([1]);
  });

  it('selects an emoji key', () => {
    expect(query(weird, "$.a['😀']")).toEqual(['emoji']);
  });

  it('selects a key containing a dot via bracket notation', () => {
    expect(query(weird, "$.a['x.y']")).toEqual([42]);
  });

  it('preserves unicode values in the output string', () => {
    expect(run(store, '$.uni')).toContain('😀');
  });
});

describe('jsonPath — output formatting', () => {
  it('pretty-prints with two-space indentation', () => {
    const out = run(data, '$.items[*].id');
    expect(out).toBe('[\n  1,\n  2\n]');
  });

  it('is deterministic / idempotent across repeated calls', () => {
    const a = run(store, '$..price');
    const b = run(store, '$..price');
    expect(a).toBe(b);
  });

  it('emits "[]" for a non-matching path', () => {
    expect(run(data, '$.nope')).toBe('[]');
  });
});

describe('jsonPath — error and edge handling', () => {
  it('throws on invalid JSON input', () => {
    expect(() => run('{bad}', '$')).toThrow();
  });

  it('throws on an empty input string', () => {
    expect(() => run('', '$')).toThrow();
  });

  it('throws on a whitespace-only input string', () => {
    expect(() => run('   ', '$')).toThrow();
  });

  it('throws on a truncated JSON document', () => {
    expect(() => run('{"a":', '$')).toThrow();
  });

  it('handles a large input without crashing', () => {
    const arr = Array.from({ length: 5000 }, (_, i) => i);
    const big = JSON.stringify({ list: arr });
    const result = query(big, '$.list[*]');
    expect(result).toHaveLength(5000);
    expect(result[4999]).toBe(4999);
  });
});

import { describe, it, expect } from 'vitest';
import { queryStringLogic } from './logic';

const toJson = (s: string): Record<string, string | string[]> =>
  JSON.parse(queryStringLogic.transform(s, { options: { mode: 'to-json' }, secondary: '' }));
const toJsonRaw = (s: string): string =>
  queryStringLogic.transform(s, { options: { mode: 'to-json' }, secondary: '' });
const toQuery = (s: string): string =>
  queryStringLogic.transform(s, { options: { mode: 'to-query' }, secondary: '' });

describe('queryString — options', () => {
  it('exposes a single mode select with two choices and a to-json default', () => {
    expect(queryStringLogic.options).toHaveLength(1);
    const mode = queryStringLogic.options![0];
    expect(mode.key).toBe('mode');
    expect(mode.type).toBe('select');
    expect(mode.default).toBe('to-json');
    expect(mode.choices?.map((c) => c.value)).toEqual(['to-json', 'to-query']);
  });

  it('defaults to to-json when no ctx is provided', () => {
    expect(JSON.parse(queryStringLogic.transform('a=1'))).toEqual({ a: '1' });
  });

  it('defaults to to-json when mode option is absent', () => {
    expect(JSON.parse(queryStringLogic.transform('a=1', { options: {}, secondary: '' }))).toEqual({
      a: '1',
    });
  });
});

describe('queryString — query → json', () => {
  it('parses a query string into an object', () => {
    expect(toJson('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('collects repeated keys into an array in order', () => {
    expect(toJson('a=1&a=2&b=3')).toEqual({ a: ['1', '2'], b: '3' });
  });

  it('collects three or more repeats into a flat array', () => {
    expect(toJson('a=1&a=2&a=3')).toEqual({ a: ['1', '2', '3'] });
  });

  it('strips a single leading question mark', () => {
    expect(toJson('?x=hello')).toEqual({ x: 'hello' });
  });

  it('strips a single leading ampersand', () => {
    expect(toJson('&a=1')).toEqual({ a: '1' });
  });

  it('handles a redundant double leading question mark', () => {
    // one ? is stripped by regex, the remaining leading ? is stripped by URLSearchParams
    expect(toJson('??a=1')).toEqual({ a: '1' });
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(toJson('   a=1&b=2   ')).toEqual({ a: '1', b: '2' });
  });

  it('returns an empty object for empty input', () => {
    expect(toJson('')).toEqual({});
  });

  it('returns an empty object for whitespace-only input', () => {
    expect(toJson('   ')).toEqual({});
  });

  it('treats a bare key with no equals as an empty-string value', () => {
    expect(toJson('a')).toEqual({ a: '' });
  });

  it('treats a key with a trailing equals as an empty-string value', () => {
    expect(toJson('a=')).toEqual({ a: '' });
  });

  it('ignores a trailing separator', () => {
    expect(toJson('a=1&')).toEqual({ a: '1' });
  });

  it('decodes plus signs as spaces', () => {
    expect(toJson('a=hello+world')).toEqual({ a: 'hello world' });
  });

  it('decodes percent-encoded special characters', () => {
    expect(toJson('a=%20%26')).toEqual({ a: ' &' });
  });

  it('decodes percent-encoded unicode/emoji', () => {
    expect(toJson('e=%F0%9F%98%80')).toEqual({ e: '😀' });
  });

  it('produces pretty-printed JSON with two-space indentation', () => {
    expect(toJsonRaw('a=1')).toBe('{\n  "a": "1"\n}');
  });

  it('is deterministic across repeated calls', () => {
    const a = toJsonRaw('z=9&a=1&a=2');
    const b = toJsonRaw('z=9&a=1&a=2');
    expect(a).toBe(b);
  });
});

describe('queryString — json → query', () => {
  it('serializes a simple object into a query string', () => {
    expect(toQuery('{"a":1,"b":"two"}')).toBe('a=1&b=two');
  });

  it('coerces non-string scalar values via String()', () => {
    expect(toQuery('{"n":0,"b":false,"x":null}')).toBe('n=0&b=false&x=null');
  });

  it('expands array values into repeated keys', () => {
    expect(toQuery('{"a":[1,2,3]}')).toBe('a=1&a=2&a=3');
  });

  it('url-encodes spaces as plus and reserved characters', () => {
    expect(toQuery('{"a":"hello world","b":"a&b=c"}')).toBe('a=hello+world&b=a%26b%3Dc');
  });

  it('url-encodes emoji values', () => {
    expect(toQuery('{"e":"😀"}')).toBe('e=%F0%9F%98%80');
  });

  it('returns an empty string for an empty object', () => {
    expect(toQuery('{}')).toBe('');
  });

  it('throws when serializing a JSON array', () => {
    expect(() => toQuery('[1,2]')).toThrow();
  });

  it('throws on null with a descriptive message', () => {
    expect(() => toQuery('null')).toThrow(/must be a JSON object/i);
  });

  it('throws on a bare JSON scalar', () => {
    expect(() => toQuery('42')).toThrow(/must be a JSON object/i);
    expect(() => toQuery('"hi"')).toThrow(/must be a JSON object/i);
  });

  it('throws on malformed JSON input', () => {
    expect(() => toQuery('not json')).toThrow();
    expect(() => toQuery('{a:1}')).toThrow();
  });
});

describe('queryString — round trips', () => {
  it('round-trips query → json → query for scalar and array values', () => {
    const original = 'a=1&a=2&b=hello+world';
    const json = toJsonRaw(original);
    expect(toQuery(json)).toBe(original);
  });

  it('round-trips json → query → json preserving structure', () => {
    const obj = { a: ['1', '2'], b: 'hello world', c: 'x' };
    const query = toQuery(JSON.stringify(obj));
    expect(toJson(query)).toEqual(obj);
  });

  it('handles a large input without losing keys', () => {
    const pairs = Array.from({ length: 500 }, (_, i) => `k${i}=${i}`);
    const result = toJson(pairs.join('&'));
    expect(Object.keys(result)).toHaveLength(500);
    expect(result.k0).toBe('0');
    expect(result.k499).toBe('499');
  });
});

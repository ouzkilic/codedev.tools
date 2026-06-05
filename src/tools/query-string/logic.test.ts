import { describe, it, expect } from 'vitest';
import { queryStringLogic } from './logic';

const toJson = (s: string) => JSON.parse(queryStringLogic.transform(s, { options: { mode: 'to-json' }, secondary: '' }));
const toQuery = (s: string) => queryStringLogic.transform(s, { options: { mode: 'to-query' }, secondary: '' });

describe('queryString', () => {
  it('parses a query string into an object', () => {
    expect(toJson('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });
  it('collects repeated keys into an array', () => {
    expect(toJson('a=1&a=2&b=3')).toEqual({ a: ['1', '2'], b: '3' });
  });
  it('strips a leading question mark', () => {
    expect(toJson('?x=hello')).toEqual({ x: 'hello' });
  });
  it('serializes an object into a query string', () => {
    expect(toQuery('{"a":1,"b":"two"}')).toBe('a=1&b=two');
  });
  it('throws when serializing a non-object', () => {
    expect(() => toQuery('[1,2]')).toThrow();
  });
});

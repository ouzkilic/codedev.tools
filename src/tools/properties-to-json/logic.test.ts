import { describe, it, expect } from 'vitest';
import { propertiesToJsonLogic } from './logic';

describe('propertiesToJsonLogic', () => {
  it('parses simple equals-separated properties', () => {
    const result = JSON.parse(propertiesToJsonLogic.transform('a=1\nb=2'));
    expect(result).toEqual({ a: '1', b: '2' });
  });

  it('skips # comments and supports colon separator', () => {
    const result = JSON.parse(propertiesToJsonLogic.transform('# comment\nx : y'));
    expect(result).toEqual({ x: 'y' });
  });

  it('skips ! bang comments', () => {
    const result = JSON.parse(propertiesToJsonLogic.transform('! bang\nfoo=bar'));
    expect(result).toEqual({ foo: 'bar' });
  });

  it('uses the first separator when both = and : appear', () => {
    const result = JSON.parse(propertiesToJsonLogic.transform('url=http://example.com'));
    expect(result).toEqual({ url: 'http://example.com' });
  });

  it('trims keys and values and skips empty lines', () => {
    const result = JSON.parse(propertiesToJsonLogic.transform('\n  key  =  value  \n'));
    expect(result).toEqual({ key: 'value' });
  });

  it('throws on a line with no separator', () => {
    expect(() => propertiesToJsonLogic.transform('novalue')).toThrow();
  });
});

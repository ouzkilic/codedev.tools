import { describe, it, expect } from 'vitest';
import { propertiesToJsonLogic } from './logic';

const parse = (input: string) => JSON.parse(propertiesToJsonLogic.transform(input));

describe('propertiesToJsonLogic', () => {
  it('parses simple equals-separated properties', () => {
    expect(parse('a=1\nb=2')).toEqual({ a: '1', b: '2' });
  });

  it('skips # comments and supports colon separator', () => {
    expect(parse('# comment\nx : y')).toEqual({ x: 'y' });
  });

  it('skips ! bang comments', () => {
    expect(parse('! bang\nfoo=bar')).toEqual({ foo: 'bar' });
  });

  it('uses the first separator when both = and : appear (url with colon after =)', () => {
    expect(parse('url=http://example.com')).toEqual({ url: 'http://example.com' });
  });

  it('trims keys and values and skips empty lines', () => {
    expect(parse('\n  key  =  value  \n')).toEqual({ key: 'value' });
  });

  it('throws on a line with no separator', () => {
    expect(() => propertiesToJsonLogic.transform('novalue')).toThrow();
  });

  it('includes the offending line in the thrown error message', () => {
    expect(() => propertiesToJsonLogic.transform('novalue')).toThrow(
      /no separator.*novalue/,
    );
  });

  it('returns an empty object for an empty string', () => {
    expect(parse('')).toEqual({});
  });

  it('returns an empty object for whitespace-only input', () => {
    expect(parse('   \n\t\n   ')).toEqual({});
  });

  it('returns an empty object when input is only comments', () => {
    expect(parse('# a\n! b\n   # c')).toEqual({});
  });

  it('uses colon as separator when it appears before the equals sign', () => {
    // 'a:b=c' -> ':' at 1, '=' at 3 -> min is 1 -> key 'a', value 'b=c'
    expect(parse('a:b=c')).toEqual({ a: 'b=c' });
  });

  it('uses equals as separator when it appears before the colon', () => {
    // 'a=b:c' -> '=' at 1, ':' at 3 -> min is 1 -> key 'a', value 'b:c'
    expect(parse('a=b:c')).toEqual({ a: 'b:c' });
  });

  it('produces an empty-string value when nothing follows the separator', () => {
    expect(parse('key=')).toEqual({ key: '' });
    expect(parse('key:')).toEqual({ key: '' });
  });

  it('produces an empty-string key when the separator is the first character', () => {
    expect(parse('=value')).toEqual({ '': 'value' });
  });

  it('keeps the last value for duplicate keys', () => {
    expect(parse('k=1\nk=2\nk=3')).toEqual({ k: '3' });
  });

  it('preserves inner whitespace in values while trimming the edges', () => {
    expect(parse('greeting =  hello   world  ')).toEqual({ greeting: 'hello   world' });
  });

  it('handles a value that contains additional separator characters verbatim', () => {
    expect(parse('expr=a = b : c')).toEqual({ expr: 'a = b : c' });
  });

  it('treats # or ! only as a comment when it is the first non-space character', () => {
    expect(parse('key=value # not a comment')).toEqual({ key: 'value # not a comment' });
  });

  it('treats indented comment markers as comments after trimming', () => {
    expect(parse('   # indented comment\nk=v')).toEqual({ k: 'v' });
  });

  it('handles unicode and emoji keys and values', () => {
    expect(parse('selam=dünya 🌍\nанклавключ=значение')).toEqual({
      selam: 'dünya 🌍',
      анклавключ: 'значение',
    });
  });

  it('handles special characters in values', () => {
    expect(parse('path=C:\\\\Users\\\\test\nquote="x"')).toEqual({
      path: 'C:\\\\Users\\\\test',
      quote: '"x"',
    });
  });

  it('parses a large input deterministically', () => {
    const lines: string[] = [];
    for (let i = 0; i < 1000; i++) lines.push(`key${i}=value${i}`);
    const result = parse(lines.join('\n'));
    expect(Object.keys(result)).toHaveLength(1000);
    expect(result.key0).toBe('value0');
    expect(result.key999).toBe('value999');
  });

  it('returns pretty-printed JSON with two-space indentation', () => {
    const out = propertiesToJsonLogic.transform('a=1');
    expect(out).toBe('{\n  "a": "1"\n}');
  });

  it('throws when any line in a multi-line input lacks a separator', () => {
    expect(() => propertiesToJsonLogic.transform('a=1\nbadline\nb=2')).toThrow();
  });

  it('handles carriage-return line endings by trimming them into the value', () => {
    // split only on \n, so \r is left on the line and trimmed away
    expect(parse('a=1\r\nb=2\r\n')).toEqual({ a: '1', b: '2' });
  });

  it('is deterministic across repeated calls', () => {
    const input = 'x=1\ny=2\n# c\nz : 3';
    const first = propertiesToJsonLogic.transform(input);
    const second = propertiesToJsonLogic.transform(input);
    expect(first).toBe(second);
  });

  it('produces valid JSON parseable back into an object', () => {
    const out = propertiesToJsonLogic.transform('a=1\nb=two');
    expect(() => JSON.parse(out)).not.toThrow();
    expect(typeof JSON.parse(out)).toBe('object');
  });

  it('parses numeric-looking values as strings', () => {
    expect(parse('n=0\nm=-5\np=3.14')).toEqual({ n: '0', m: '-5', p: '3.14' });
  });
});

import { describe, it, expect } from 'vitest';
import { textRepeatLogic } from './logic';

describe('textRepeatLogic', () => {
  it('repeats with comma separator', () => {
    expect(
      textRepeatLogic.transform('ab', { options: { count: '3', separator: ',' }, secondary: '' }),
    ).toBe('ab,ab,ab');
  });

  it('returns input unchanged when count is 1', () => {
    expect(
      textRepeatLogic.transform('hello', { options: { count: '1', separator: '\n' }, secondary: '' }),
    ).toBe('hello');
  });

  it('clamps count 0 to 1', () => {
    expect(
      textRepeatLogic.transform('x', { options: { count: '0', separator: ',' }, secondary: '' }),
    ).toBe('x');
  });

  it('uses newline default separator', () => {
    expect(
      textRepeatLogic.transform('a', { options: { count: '2', separator: '\n' }, secondary: '' }),
    ).toBe('a\na');
  });

  it('falls back to count 1 on invalid count input', () => {
    expect(
      textRepeatLogic.transform('z', { options: { count: 'abc', separator: '' }, secondary: '' }),
    ).toBe('z');
  });

  it('joins with space separator', () => {
    expect(
      textRepeatLogic.transform('hi', { options: { count: '3', separator: ' ' }, secondary: '' }),
    ).toBe('hi hi hi');
  });

  it('joins with empty separator (concatenation)', () => {
    expect(
      textRepeatLogic.transform('ab', { options: { count: '4', separator: '' }, secondary: '' }),
    ).toBe('abababab');
  });

  it('exposes two options: count and separator', () => {
    const keys = textRepeatLogic.options?.map((o) => o.key);
    expect(keys).toEqual(['count', 'separator']);
  });

  it('default count option is 3', () => {
    const countOpt = textRepeatLogic.options?.find((o) => o.key === 'count');
    expect(countOpt?.default).toBe('3');
  });

  it('default separator option is newline', () => {
    const sepOpt = textRepeatLogic.options?.find((o) => o.key === 'separator');
    expect(sepOpt?.default).toBe('\n');
  });

  it('separator option offers exactly newline, comma, space, none', () => {
    const sepOpt = textRepeatLogic.options?.find((o) => o.key === 'separator');
    expect(sepOpt?.choices?.map((c) => c.value)).toEqual(['\n', ',', ' ', '']);
  });

  it('defaults to count 3 with newline when no ctx is provided', () => {
    expect(textRepeatLogic.transform('q')).toBe('q\nq\nq');
  });

  it('defaults count to 3 when options omit count', () => {
    expect(
      textRepeatLogic.transform('m', { options: { separator: ',' }, secondary: '' }),
    ).toBe('m,m,m');
  });

  it('defaults separator to newline when options omit separator', () => {
    expect(
      textRepeatLogic.transform('w', { options: { count: '2' }, secondary: '' }),
    ).toBe('w\nw');
  });

  it('parses leading-numeric strings via parseInt (e.g. "5abc" -> 5)', () => {
    expect(
      textRepeatLogic.transform('p', { options: { count: '5abc', separator: '' }, secondary: '' }),
    ).toBe('ppppp');
  });

  it('clamps negative counts up to 1', () => {
    expect(
      textRepeatLogic.transform('n', { options: { count: '-7', separator: ',' }, secondary: '' }),
    ).toBe('n');
  });

  it('clamps counts above 10000 down to 10000', () => {
    const out = textRepeatLogic.transform('a', {
      options: { count: '99999', separator: '' },
      secondary: '',
    });
    expect(out.length).toBe(10000);
    expect(out).toBe('a'.repeat(10000));
  });

  it('handles empty input string', () => {
    expect(
      textRepeatLogic.transform('', { options: { count: '3', separator: ',' }, secondary: '' }),
    ).toBe(',,');
  });

  it('preserves unicode and emoji', () => {
    expect(
      textRepeatLogic.transform('🚀é', { options: { count: '3', separator: '-' }, secondary: '' }),
    ).toBe('🚀é-🚀é-🚀é');
  });

  it('produces n copies joined by n-1 separators', () => {
    const n = 50;
    const out = textRepeatLogic.transform('foo', {
      options: { count: String(n), separator: ',' },
      secondary: '',
    });
    expect(out.split(',')).toHaveLength(n);
    expect(out.split(',').every((p) => p === 'foo')).toBe(true);
  });

  it('treats float-like count by truncating via parseInt ("2.9" -> 2)', () => {
    expect(
      textRepeatLogic.transform('a', { options: { count: '2.9', separator: '' }, secondary: '' }),
    ).toBe('aa');
  });

  it('multi-line input with newline separator stays intact', () => {
    const input = 'line1\nline2';
    const out = textRepeatLogic.transform(input, {
      options: { count: '2', separator: '\n' },
      secondary: '',
    });
    expect(out).toBe('line1\nline2\nline1\nline2');
  });
});

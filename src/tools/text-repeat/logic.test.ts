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
});

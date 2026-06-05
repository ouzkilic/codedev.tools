import { describe, it, expect } from 'vitest';
import { findReplaceLogic } from './logic';

const run = (input: string, options: Record<string, string | boolean>) =>
  findReplaceLogic.transform(input, { options, secondary: '' });

describe('findReplace', () => {
  it('replaces all literal occurrences', () => {
    expect(run('cat cat dog', { find: 'cat', replace: 'fish' })).toBe('fish fish dog');
  });
  it('supports regex replacement', () => {
    expect(run('a1b2c3', { find: '\\d', replace: '#', regex: true })).toBe('a#b#c#');
  });
  it('supports case-insensitive literal replace', () => {
    expect(run('Cat cat', { find: 'cat', replace: 'x', ci: true })).toBe('x x');
  });
  it('returns input unchanged when find is empty', () => {
    expect(run('hello', { find: '', replace: 'x' })).toBe('hello');
  });
  it('throws on invalid regex', () => {
    expect(() => run('x', { find: '(', replace: '', regex: true })).toThrow();
  });
});

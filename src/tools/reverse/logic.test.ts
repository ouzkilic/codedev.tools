import { describe, it, expect } from 'vitest';
import { reverseLogic } from './logic';

const rev = (s: string, unit: string) => reverseLogic.transform(s, { options: { unit }, secondary: '' });

describe('reverse', () => {
  it('reverses characters', () => {
    expect(rev('abc', 'characters')).toBe('cba');
  });
  it('reverses words', () => {
    expect(rev('one two three', 'words')).toBe('three two one');
  });
  it('reverses lines', () => {
    expect(rev('a\nb\nc', 'lines')).toBe('c\nb\na');
  });
  it('handles unicode characters', () => {
    expect(rev('a😀b', 'characters')).toBe('b😀a');
  });
});

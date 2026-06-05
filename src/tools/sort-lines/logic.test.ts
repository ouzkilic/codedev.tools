import { describe, it, expect } from 'vitest';
import { sortLinesLogic } from './logic';

const sort = (s: string, options: Record<string, string | boolean>) =>
  sortLinesLogic.transform(s, { options, secondary: '' });

describe('sortLines', () => {
  it('sorts alphabetically ascending', () => {
    expect(sort('b\na\nc', { mode: 'alpha', order: 'asc' })).toBe('a\nb\nc');
  });
  it('sorts descending', () => {
    expect(sort('a\nb\nc', { mode: 'alpha', order: 'desc' })).toBe('c\nb\na');
  });
  it('sorts numerically (not lexically)', () => {
    expect(sort('10\n2\n1', { mode: 'numeric', order: 'asc' })).toBe('1\n2\n10');
  });
  it('sorts by length', () => {
    expect(sort('aaa\na\naa', { mode: 'length', order: 'asc' })).toBe('a\naa\naaa');
  });
  it('is case-insensitive when enabled', () => {
    expect(sort('B\na\nC', { mode: 'alpha', order: 'asc', ci: true })).toBe('a\nB\nC');
  });
});

import { describe, it, expect } from 'vitest';
import { whitespaceLogic } from './logic';

const run = (s: string, options: Record<string, boolean>) =>
  whitespaceLogic.transform(s, { options, secondary: '' });

describe('whitespace', () => {
  it('trims each line', () => {
    expect(run('  a  \n  b ', { trimLines: true })).toBe('a\nb');
  });
  it('collapses repeated spaces', () => {
    expect(run('a    b', { collapse: true })).toBe('a b');
  });
  it('removes empty lines', () => {
    expect(run('a\n\n  \nb', { removeEmpty: true })).toBe('a\nb');
  });
  it('combines options', () => {
    expect(run('  a   b  \n\n c ', { trimLines: true, collapse: true, removeEmpty: true })).toBe('a b\nc');
  });
});

import { describe, it, expect } from 'vitest';
import { wordFreqLogic } from './logic';

const run = (s: string, options: Record<string, boolean> = {}) =>
  wordFreqLogic.transform(s, { options, secondary: '' });

describe('wordFreq', () => {
  it('counts words sorted by frequency', () => {
    expect(run('the cat the dog the')).toBe('3\tthe\n1\tcat\n1\tdog');
  });
  it('is case-insensitive by default', () => {
    expect(run('The the THE')).toBe('3\tthe');
  });
  it('respects case-sensitivity when enabled', () => {
    expect(run('The the', { caseSensitive: true })).toBe('1\tThe\n1\tthe');
  });
  it('breaks frequency ties alphabetically', () => {
    expect(run('b a')).toBe('1\ta\n1\tb');
  });
});

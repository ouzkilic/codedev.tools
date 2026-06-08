import { describe, it, expect } from 'vitest';
import { padTruncateLogic } from './logic';

describe('padTruncateLogic', () => {
  it('pads end with given char', () => {
    expect(
      padTruncateLogic.transform('ab', {
        options: { width: '5', char: '*', side: 'end', mode: 'pad' },
        secondary: '',
      }),
    ).toBe('ab***');
  });

  it('pads start with given char', () => {
    expect(
      padTruncateLogic.transform('ab', {
        options: { width: '5', char: '*', side: 'start', mode: 'pad' },
        secondary: '',
      }),
    ).toBe('***ab');
  });

  it('truncates to width', () => {
    expect(
      padTruncateLogic.transform('abcdef', {
        options: { width: '3', char: ' ', side: 'end', mode: 'truncate' },
        secondary: '',
      }),
    ).toBe('abc');
  });

  it('applies both truncate then pad', () => {
    expect(
      padTruncateLogic.transform('abcdef', {
        options: { width: '4', char: '-', side: 'end', mode: 'both' },
        secondary: '',
      }),
    ).toBe('abcd');
  });

  it('applies per line for multi-line input', () => {
    expect(
      padTruncateLogic.transform('ab\nc', {
        options: { width: '4', char: '.', side: 'end', mode: 'pad' },
        secondary: '',
      }),
    ).toBe('ab..\nc...');
  });

  it('clamps invalid width to 0 producing empty truncation', () => {
    expect(
      padTruncateLogic.transform('hello', {
        options: { width: 'xyz', char: ' ', side: 'end', mode: 'truncate' },
        secondary: '',
      }),
    ).toBe('');
  });
});

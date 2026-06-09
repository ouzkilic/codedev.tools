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

  it('returns an empty string for empty input', () => {
    expect(run('')).toBe('');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(run('   \n\t  ')).toBe('');
  });

  it('returns an empty string when only punctuation is present', () => {
    expect(run('!@#$ ... --- ;;;')).toBe('');
  });

  it('uses a tab separator between count and word', () => {
    const out = run('hi');
    expect(out).toBe('1\thi');
    expect(out).toContain('\t');
  });

  it('joins multiple entries with newlines (one per line)', () => {
    const out = run('alpha beta gamma');
    expect(out.split('\n')).toHaveLength(3);
  });

  it('treats numbers as words', () => {
    expect(run('42 42 7')).toBe('2\t42\n1\t7');
  });

  it('treats apostrophes as part of a word', () => {
    expect(run("don't don't can't")).toBe("2\tdon't\n1\tcan't");
  });

  it('splits on a wide range of whitespace and punctuation', () => {
    expect(run('one,two;three.four')).toBe('1\tfour\n1\tone\n1\tthree\n1\ttwo');
  });

  it('counts unicode letters', () => {
    // café appears twice, naïve once; sorted by count desc then alpha asc
    expect(run('café café naïve')).toBe('2\tcafé\n1\tnaïve');
  });

  it('drops emoji (not letters or numbers) but keeps surrounding words', () => {
    const out = run('hello 😀 hello world');
    expect(out).toBe('2\thello\n1\tworld');
    expect(out).not.toContain('😀');
  });

  it('case-sensitive mode keeps original casing in the output', () => {
    const out = run('Apple apple APPLE', { caseSensitive: true });
    expect(out).toContain('APPLE');
    expect(out).toContain('Apple');
    expect(out).toContain('apple');
    expect(out.split('\n')).toHaveLength(3);
  });

  it('case-insensitive mode lowercases the reported word', () => {
    expect(run('HELLO Hello hello')).toBe('3\thello');
  });

  it('orders strictly by descending frequency', () => {
    const out = run('a a a b b c');
    expect(out).toBe('3\ta\n2\tb\n1\tc');
  });

  it('is idempotent on a single distinct word regardless of repetition', () => {
    expect(run('x x x x x')).toBe('5\tx');
  });

  it('handles large input deterministically', () => {
    const input = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? 'foo' : 'bar')).join(' ');
    expect(run(input)).toBe('500\tbar\n500\tfoo');
  });

  it('exposes a single caseSensitive toggle option defaulting to false', () => {
    expect(wordFreqLogic.options).toEqual([
      { key: 'caseSensitive', label: 'Case-sensitive', type: 'toggle', default: false },
    ]);
  });

  it('defaults caseSensitive to false when ctx is omitted', () => {
    expect(wordFreqLogic.transform('The the')).toBe('2\tthe');
  });
});

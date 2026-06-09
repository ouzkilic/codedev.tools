import { describe, it, expect } from 'vitest';
import { dedupeLinesLogic } from './logic';

const dedupe = (s: string, options: Record<string, string | boolean> = {}) =>
  dedupeLinesLogic.transform(s, { options, secondary: '' });

describe('dedupeLines', () => {
  it('removes duplicates, keeping first occurrence order', () => {
    expect(dedupe('a\nb\na\nc\nb')).toBe('a\nb\nc');
  });

  it('treats case-sensitively by default', () => {
    expect(dedupe('A\na')).toBe('A\na');
  });

  it('merges case variants when case-insensitive', () => {
    expect(dedupe('A\na\nB', { ci: true })).toBe('A\nB');
  });

  it('trims before comparing when enabled', () => {
    expect(dedupe('a\n a ', { trim: true })).toBe('a');
  });

  it('returns empty string for empty input', () => {
    // ''.split('\n') === [''], a single empty line, joined back to ''
    expect(dedupe('')).toBe('');
  });

  it('keeps a single line unchanged', () => {
    expect(dedupe('only')).toBe('only');
  });

  it('leaves already-unique lines untouched and ordered', () => {
    expect(dedupe('a\nb\nc')).toBe('a\nb\nc');
  });

  it('collapses repeated blank lines into one', () => {
    // five lines: '', '', '', '', '' -> single ''
    expect(dedupe('\n\n\n\n')).toBe('');
  });

  it('dedupes blank lines interspersed with content', () => {
    expect(dedupe('a\n\nb\n\nc')).toBe('a\n\nb\nc');
  });

  it('preserves the first occurrence and drops all later ones', () => {
    expect(dedupe('x\ny\nx\nx\nz\ny')).toBe('x\ny\nz');
  });

  it('does not trim by default (whitespace makes lines distinct)', () => {
    expect(dedupe('a\n a')).toBe('a\n a');
  });

  it('treats differently-spaced lines as equal when trimmed, emitting the trimmed form', () => {
    // first occurrence ' a ' trims to 'a'; output is the trimmed value
    expect(dedupe(' a \nb\n\ta\t', { trim: true })).toBe('a\nb');
  });

  it('trims tabs and surrounding spaces consistently', () => {
    expect(dedupe('\thello\t\nhello\n  hello  ', { trim: true })).toBe('hello');
  });

  it('combines trim and case-insensitive options', () => {
    // ' A ' -> trim 'A' -> key 'a'; 'a' -> key 'a' (dup); 'B ' -> trim 'B'
    expect(dedupe(' A \na\nB ', { trim: true, ci: true })).toBe('A\nB');
  });

  it('lowercases for the key but emits the original casing under ci', () => {
    expect(dedupe('HELLO\nhello\nHeLLo', { ci: true })).toBe('HELLO');
  });

  it('handles whitespace-only input without trim as distinct lines', () => {
    // '   ' is one line; '   \n   ' is two identical lines -> one
    expect(dedupe('   \n   ')).toBe('   ');
  });

  it('whitespace-only lines with trim collapse to a single empty line', () => {
    expect(dedupe('   \n\t\n  ', { trim: true })).toBe('');
  });

  it('treats trailing newline as a trailing empty line', () => {
    // 'a\n' -> ['a',''] both unique -> 'a\n' (rejoined keeps trailing newline as empty)
    expect(dedupe('a\n')).toBe('a\n');
  });

  it('dedupes a duplicated line that includes the trailing empty entry', () => {
    // 'a\na\n' -> ['a','a',''] -> 'a' then '' -> 'a\n'
    expect(dedupe('a\na\n')).toBe('a\n');
  });

  it('preserves unicode and emoji distinctness', () => {
    expect(dedupe('café\ncafé\n😀\n😀\n😎')).toBe('café\n😀\n😎');
  });

  it('distinguishes accented characters by default but folds case via ci where applicable', () => {
    // 'É' lowercases to 'é' under ci; 'é' key matches
    expect(dedupe('É\né', { ci: true })).toBe('É');
  });

  it('treats different unicode characters as distinct under ci', () => {
    expect(dedupe('Ω\nω', { ci: true })).toBe('Ω');
  });

  it('handles special / punctuation characters as ordinary content', () => {
    expect(dedupe('!@#\n!@#\n$%^')).toBe('!@#\n$%^');
  });

  it('keeps carriage returns as part of the line content', () => {
    // split is only on '\n'; '\r' stays attached, so 'a\r' !== 'a'
    expect(dedupe('a\r\na')).toBe('a\r\na');
  });

  it('is idempotent: running on its own output yields the same result', () => {
    const once = dedupe('a\nb\na\nc\nb\na', { trim: true, ci: true });
    expect(dedupe(once, { trim: true, ci: true })).toBe(once);
  });

  it('is deterministic across repeated calls', () => {
    const input = 'one\ntwo\none\nthree\ntwo';
    expect(dedupe(input)).toBe(dedupe(input));
  });

  it('handles a large input efficiently and dedupes to the unique set', () => {
    // 10000 lines, only 100 distinct values cycling
    const lines: string[] = [];
    for (let i = 0; i < 10000; i++) lines.push(`line${i % 100}`);
    const result = dedupe(lines.join('\n'));
    const outLines = result.split('\n');
    expect(outLines.length).toBe(100);
    expect(outLines[0]).toBe('line0');
    expect(outLines[99]).toBe('line99');
  });

  it('treats numeric-string lines as plain strings', () => {
    expect(dedupe('0\n-0\n0\n00\n-1')).toBe('0\n-0\n00\n-1');
  });

  it('preserves leading separator producing a leading empty line', () => {
    // '\na\nb' -> ['','a','b'] all unique
    expect(dedupe('\na\nb')).toBe('\na\nb');
  });

  it('reads options.trim/ci as truthy via Boolean coercion (string "false" is truthy)', () => {
    // Boolean('false') === true, so trim is enabled here
    expect(dedupe('a\n a ', { trim: 'true' })).toBe('a');
  });

  it('works with no options object / missing ctx options gracefully', () => {
    // ctx with empty options behaves as all-false defaults
    expect(dedupe('a\nA\na')).toBe('a\nA');
  });

  it('does not introduce extra newlines or alter the join character', () => {
    const out = dedupe('a\nb\nc');
    expect(out.split('\n')).toEqual(['a', 'b', 'c']);
  });
});

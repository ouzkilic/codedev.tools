import { describe, it, expect } from 'vitest';
import { sortLinesLogic } from './logic';

const sort = (s: string, options: Record<string, string | boolean> = {}) =>
  sortLinesLogic.transform(s, { options, secondary: '' });

describe('sortLines', () => {
  // --- existing assertions (kept) ---
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

  // --- metadata / option definitions ---
  it('exposes the expected option definitions', () => {
    const keys = (sortLinesLogic.options ?? []).map((o) => o.key);
    expect(keys).toEqual(['mode', 'order', 'ci']);
    const mode = (sortLinesLogic.options ?? []).find((o) => o.key === 'mode');
    expect(mode?.default).toBe('alpha');
    expect((mode?.choices ?? []).map((c) => c.value)).toEqual(['alpha', 'numeric', 'length']);
    const ci = (sortLinesLogic.options ?? []).find((o) => o.key === 'ci');
    expect(ci?.type).toBe('toggle');
    expect(ci?.default).toBe(false);
  });

  // --- defaults / missing options ---
  it('defaults to alphabetical ascending when no options given', () => {
    // mode defaults to 'alpha', ci defaults to false, order is not 'desc'
    expect(sort('c\na\nb')).toBe('a\nb\nc');
  });
  it('treats absence of order as ascending (no reverse)', () => {
    expect(sort('b\na', { mode: 'alpha' })).toBe('a\nb');
  });

  // --- alpha: code-unit ordering, uppercase before lowercase ---
  it('puts uppercase before lowercase in case-sensitive alpha sort', () => {
    // 'B' (0x42) < 'a' (0x61) in code-unit comparison
    expect(sort('a\nB', { mode: 'alpha', order: 'asc' })).toBe('B\na');
  });
  it('keeps equal alpha lines stable (no spurious reordering)', () => {
    expect(sort('x\nx\nx', { mode: 'alpha', order: 'asc' })).toBe('x\nx\nx');
  });
  it('alpha descending reverses the ascending result', () => {
    const input = 'delta\nalpha\ncharlie\nbravo';
    const asc = sort(input, { mode: 'alpha', order: 'asc' });
    const desc = sort(input, { mode: 'alpha', order: 'desc' });
    expect(asc).toBe('alpha\nbravo\ncharlie\ndelta');
    expect(desc).toBe('delta\ncharlie\nbravo\nalpha');
  });

  // --- numeric mode ---
  it('handles negative and zero numbers numerically', () => {
    expect(sort('3\n-5\n0\n-1\n2', { mode: 'numeric', order: 'asc' })).toBe('-5\n-1\n0\n2\n3');
  });
  it('handles floating point numbers numerically', () => {
    expect(sort('1.5\n1.05\n1.25', { mode: 'numeric', order: 'asc' })).toBe('1.05\n1.25\n1.5');
  });
  it('treats non-numeric lines as 0 in numeric mode', () => {
    // parseFloat('abc') -> NaN -> 0; parseFloat('-2') -> -2; parseFloat('5') -> 5
    expect(sort('5\nabc\n-2', { mode: 'numeric', order: 'asc' })).toBe('-2\nabc\n5');
  });
  it('parses leading numeric prefixes via parseFloat', () => {
    // parseFloat('12px') -> 12, parseFloat('3em') -> 3
    expect(sort('12px\n3em\n7rem', { mode: 'numeric', order: 'asc' })).toBe('3em\n7rem\n12px');
  });
  it('numeric descending reverses numeric ascending', () => {
    expect(sort('1\n2\n3', { mode: 'numeric', order: 'desc' })).toBe('3\n2\n1');
  });

  // --- length mode ---
  it('length descending puts longest first', () => {
    expect(sort('a\naaa\naa', { mode: 'length', order: 'desc' })).toBe('aaa\naa\na');
  });
  it('counts emoji as UTF-16 code units in length mode', () => {
    // '😀'.length === 2, 'ab'.length === 2, 'x'.length === 1
    // 'x' (1) sorts before the two length-2 entries; stable order preserves '😀' then 'ab'
    expect(sort('😀\nab\nx', { mode: 'length', order: 'asc' })).toBe('x\n😀\nab');
  });

  // --- case-insensitive ---
  it('case-insensitive descending', () => {
    expect(sort('a\nC\nB', { mode: 'alpha', order: 'desc', ci: true })).toBe('C\nB\na');
  });
  it('ci=false keeps case-sensitive ordering distinct from ci=true', () => {
    const input = 'banana\nApple\ncherry';
    // case-sensitive: 'Apple' (A=0x41) before lowercase entries
    expect(sort(input, { mode: 'alpha', order: 'asc', ci: false })).toBe('Apple\nbanana\ncherry');
    // case-insensitive: alphabetical ignoring case
    expect(sort(input, { mode: 'alpha', order: 'asc', ci: true })).toBe('Apple\nbanana\ncherry');
  });

  // --- edge cases ---
  it('returns empty string unchanged', () => {
    expect(sort('', { mode: 'alpha', order: 'asc' })).toBe('');
  });
  it('returns single line unchanged', () => {
    expect(sort('only', { mode: 'alpha', order: 'asc' })).toBe('only');
  });
  it('preserves blank lines and sorts them to the front in alpha asc', () => {
    // empty string '' is less than any non-empty string
    expect(sort('b\n\na', { mode: 'alpha', order: 'asc' })).toBe('\na\nb');
  });
  it('handles leading and trailing newlines (empty edge lines)', () => {
    // '\nb\na\n'.split('\n') => ['', 'b', 'a', ''] ; sorted asc => ['', '', 'a', 'b']
    expect(sort('\nb\na\n', { mode: 'alpha', order: 'asc' })).toBe('\n\na\nb');
  });
  it('sorts unicode and special characters deterministically', () => {
    const input = 'éclair\nabacus\n#hash\nZebra';
    // code units: '#' 0x23, 'Z' 0x5A, 'a' 0x61, 'é' 0xE9
    expect(sort(input, { mode: 'alpha', order: 'asc' })).toBe('#hash\nZebra\nabacus\néclair');
  });
  it('handles whitespace-only lines', () => {
    // ' ' (0x20) vs '  ' (two spaces): both start with space; shorter '' part... compared char by char
    // '' < ' ' < '  ' in string comparison
    expect(sort('  \n \n', { mode: 'alpha', order: 'asc' })).toBe('\n \n  ');
  });

  // --- determinism / idempotency ---
  it('is deterministic across repeated calls', () => {
    const input = 'gamma\nalpha\nbeta';
    const a = sort(input, { mode: 'alpha', order: 'asc' });
    const b = sort(input, { mode: 'alpha', order: 'asc' });
    expect(a).toBe(b);
  });
  it('is idempotent: sorting an already-sorted list yields the same result', () => {
    const once = sort('c\nb\na', { mode: 'alpha', order: 'asc' });
    const twice = sort(once, { mode: 'alpha', order: 'asc' });
    expect(once).toBe('a\nb\nc');
    expect(twice).toBe(once);
  });
  it('does not lose or duplicate lines (line count preserved)', () => {
    const input = 'one\ntwo\nthree\nfour\nfive';
    const out = sort(input, { mode: 'length', order: 'desc' });
    expect(out.split('\n')).toHaveLength(5);
    expect(out.split('\n').sort()).toEqual(input.split('\n').sort());
  });

  // --- large input ---
  it('handles a large input without crashing and sorts correctly', () => {
    const n = 5000;
    const nums = Array.from({ length: n }, (_, i) => String(n - i)); // n..1
    const out = sort(nums.join('\n'), { mode: 'numeric', order: 'asc' });
    const lines = out.split('\n');
    expect(lines).toHaveLength(n);
    expect(lines[0]).toBe('1');
    expect(lines[n - 1]).toBe(String(n));
  });
});

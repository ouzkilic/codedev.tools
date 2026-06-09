import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { tomlFormatterLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };

describe('tomlFormatterLogic', () => {
  it('formats a simple key-value pair (normalizes spacing + trailing newline)', () => {
    expect(tomlFormatterLogic.transform('a=1', ctx)).toBe('a = 1\n');
  });

  it('formats a table', () => {
    const out = tomlFormatterLogic.transform('[t]\nb = 2', ctx);
    expect(out).toContain('[t]');
    expect(out).toContain('b = 2');
  });

  it('throws on invalid TOML (key starts with =)', () => {
    expect(() => tomlFormatterLogic.transform('= bad', ctx)).toThrow();
  });

  it('formats a string value', () => {
    expect(tomlFormatterLogic.transform('name = "Tom"', ctx)).toBe('name = "Tom"\n');
  });

  it('formats a float value', () => {
    expect(tomlFormatterLogic.transform('y = 3.14', ctx)).toBe('y = 3.14\n');
  });

  it('formats a boolean value', () => {
    expect(tomlFormatterLogic.transform('b = true', ctx)).toBe('b = true\n');
  });

  it('formats a negative integer', () => {
    expect(tomlFormatterLogic.transform('n = -17', ctx)).toBe('n = -17\n');
  });

  it('formats an array with spaced brackets', () => {
    expect(tomlFormatterLogic.transform('arr = [1, 2, 3]', ctx)).toBe('arr = [ 1, 2, 3 ]\n');
  });

  it('expands a dotted key into a table header', () => {
    expect(tomlFormatterLogic.transform('a.b.c = 1', ctx)).toBe('[a.b]\nc = 1\n');
  });

  it('expands an inline table into a standard table', () => {
    const out = tomlFormatterLogic.transform('pt = { x = 1, y = 2 }', ctx);
    expect(out).toBe('[pt]\nx = 1\ny = 2\n');
  });

  it('keeps a quoted key quoted', () => {
    expect(tomlFormatterLogic.transform('"127.0.0.1" = "value"', ctx)).toBe(
      '"127.0.0.1" = "value"\n',
    );
  });

  it('preserves a nested table header', () => {
    const out = tomlFormatterLogic.transform('[a.b]\nc = 1', ctx);
    expect(out).toBe('[a.b]\nc = 1\n');
  });

  it('separates array-of-tables entries with a blank line', () => {
    const out = tomlFormatterLogic.transform('[[products]]\nname = "A"\n[[products]]\nname = "B"', ctx);
    expect(out).toBe('[[products]]\nname = "A"\n\n[[products]]\nname = "B"\n');
  });

  it('normalizes a datetime to ISO format', () => {
    const out = tomlFormatterLogic.transform('d = 1979-05-27T07:32:00Z', ctx);
    expect(out).toBe('d = 1979-05-27T07:32:00.000Z\n');
  });

  it('preserves unicode and emoji in string values', () => {
    const out = tomlFormatterLogic.transform('greet = "héllo 😀 мир"', ctx);
    expect(out).toBe('greet = "héllo 😀 мир"\n');
  });

  it('returns just a newline for empty input', () => {
    expect(tomlFormatterLogic.transform('', ctx)).toBe('\n');
  });

  it('returns just a newline for whitespace-only input', () => {
    expect(tomlFormatterLogic.transform('   \n\t  \n', ctx)).toBe('\n');
  });

  it('returns just a newline for comment-only input (comments are dropped)', () => {
    expect(tomlFormatterLogic.transform('# just a comment', ctx)).toBe('\n');
  });

  it('is idempotent: formatting already-formatted output yields the same result', () => {
    const once = tomlFormatterLogic.transform('a=1\n[t]\nb="x"', ctx);
    const twice = tomlFormatterLogic.transform(once, ctx);
    expect(twice).toBe(once);
  });

  it('handles large input without losing entries', () => {
    const input = Array.from({ length: 1000 }, (_, i) => `k${i} = ${i}`).join('\n');
    const out = tomlFormatterLogic.transform(input, ctx);
    expect(out).toContain('k0 = 0\n');
    expect(out).toContain('k999 = 999\n');
    expect(out.trim().split('\n')).toHaveLength(1000);
  });

  it('throws on duplicate key definitions', () => {
    expect(() => tomlFormatterLogic.transform('a = 1\na = 2', ctx)).toThrow();
  });

  it('throws on an unterminated string', () => {
    expect(() => tomlFormatterLogic.transform('a = "', ctx)).toThrow();
  });

  it('surfaces a non-empty error message when input is invalid', () => {
    expect(() => tomlFormatterLogic.transform('= bad', ctx)).toThrow(/.+/);
  });

  it('always terminates valid output with a trailing newline', () => {
    const out = tomlFormatterLogic.transform('x = 1', ctx);
    expect(out.endsWith('\n')).toBe(true);
  });
});

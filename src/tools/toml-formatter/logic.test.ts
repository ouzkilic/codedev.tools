import { describe, expect, it } from 'vitest';
import { tomlFormatterLogic } from './logic';

const ctx = { options: {}, secondary: '' };

describe('tomlFormatterLogic', () => {
  it('formats a simple key-value pair', () => {
    expect(tomlFormatterLogic.transform('a=1', ctx)).toBe('a = 1\n');
  });

  it('formats a table', () => {
    const out = tomlFormatterLogic.transform('[t]\nb = 2', ctx);
    expect(out).toContain('[t]');
    expect(out).toContain('b = 2');
  });

  it('throws on invalid TOML', () => {
    expect(() => tomlFormatterLogic.transform('= bad', ctx)).toThrow();
  });
});

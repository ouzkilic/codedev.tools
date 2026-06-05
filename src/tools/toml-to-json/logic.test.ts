import { describe, it, expect } from 'vitest';
import { tomlToJsonLogic } from './logic';

const toObj = (s: string) => JSON.parse(tomlToJsonLogic.transform(s));

describe('tomlToJson', () => {
  it('parses top-level keys', () => {
    expect(toObj('title = "x"')).toEqual({ title: 'x' });
  });
  it('parses tables into nested objects', () => {
    expect(toObj('[owner]\nname = "Ada"')).toEqual({ owner: { name: 'Ada' } });
  });
  it('parses numbers and arrays', () => {
    expect(toObj('n = 42\nlist = [1, 2, 3]')).toEqual({ n: 42, list: [1, 2, 3] });
  });
  it('throws on invalid TOML', () => {
    expect(() => tomlToJsonLogic.transform('= broken')).toThrow();
  });
});

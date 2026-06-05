import { describe, it, expect } from 'vitest';
import { jsonFormatterLogic } from './logic';

describe('jsonFormatter', () => {
  it('indents JSON', () => {
    expect(jsonFormatterLogic.transform('{"a":1}')).toBe('{\n  "a": 1\n}');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonFormatterLogic.transform('{bad}')).toThrow();
  });
});

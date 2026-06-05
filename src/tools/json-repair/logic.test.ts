import { describe, it, expect } from 'vitest';
import { jsonRepairLogic } from './logic';

describe('jsonRepair', () => {
  it('quotes unquoted keys', () => {
    expect(jsonRepairLogic.transform('{a:1}')).toBe('{\n  "a": 1\n}');
  });
  it('removes trailing commas', () => {
    expect(jsonRepairLogic.transform('{"a":1,}')).toBe('{\n  "a": 1\n}');
  });
  it('converts single quotes to double quotes', () => {
    expect(jsonRepairLogic.transform("{'a':'b'}")).toBe('{\n  "a": "b"\n}');
  });
  it('leaves valid JSON intact (idempotent)', () => {
    const valid = '{\n  "a": 1\n}';
    expect(jsonRepairLogic.transform(valid)).toBe(valid);
  });
  it('throws on empty input', () => {
    expect(() => jsonRepairLogic.transform('')).toThrow();
  });
});

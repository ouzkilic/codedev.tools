import { describe, it, expect } from 'vitest';
import { jsonSchemaToJsonLogic } from './logic';

describe('jsonSchemaToJsonLogic', () => {
  it('generates object sample', () => {
    const input = '{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"}}}';
    const out = jsonSchemaToJsonLogic.transform(input, { options: {}, secondary: '' });
    expect(JSON.parse(out)).toEqual({ id: 0, name: 'string' });
  });

  it('generates array sample', () => {
    const input = '{"type":"array","items":{"type":"number"}}';
    const out = jsonSchemaToJsonLogic.transform(input, { options: {}, secondary: '' });
    expect(JSON.parse(out)).toEqual([0]);
  });

  it('uses first enum value', () => {
    const input = '{"enum":["a","b"]}';
    const out = jsonSchemaToJsonLogic.transform(input, { options: {}, secondary: '' });
    expect(JSON.parse(out)).toBe('a');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonSchemaToJsonLogic.transform('{bad', { options: {}, secondary: '' })).toThrow();
  });
});

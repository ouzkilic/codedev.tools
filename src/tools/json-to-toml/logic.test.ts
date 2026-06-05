import { describe, it, expect } from 'vitest';
import { jsonToTomlLogic } from './logic';

describe('jsonToToml', () => {
  it('serializes top-level keys', () => {
    expect(jsonToTomlLogic.transform('{"title":"x"}')).toContain('title = "x"');
  });
  it('serializes nested objects as tables', () => {
    const out = jsonToTomlLogic.transform('{"owner":{"name":"Ada"}}');
    expect(out).toContain('[owner]');
    expect(out).toContain('name = "Ada"');
  });
  it('throws when the root is not an object', () => {
    expect(() => jsonToTomlLogic.transform('[1,2]')).toThrow();
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToTomlLogic.transform('{bad}')).toThrow();
  });
});

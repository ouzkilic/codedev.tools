import { describe, it, expect } from 'vitest';
import { yamlToJsonLogic } from './logic';

describe('yamlToJson', () => {
  it('converts scalars and sequences', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('a: 1\nb:\n  - 1\n  - 2'))).toEqual({ a: 1, b: [1, 2] });
  });
  it('converts nested mappings', () => {
    expect(JSON.parse(yamlToJsonLogic.transform('x:\n  y: hello'))).toEqual({ x: { y: 'hello' } });
  });
  it('throws on invalid YAML', () => {
    expect(() => yamlToJsonLogic.transform('a:\n - 1\n- 2')).toThrow();
  });
});

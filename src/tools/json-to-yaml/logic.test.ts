import { describe, it, expect } from 'vitest';
import { jsonToYamlLogic } from './logic';

describe('jsonToYaml', () => {
  it('dumps objects and arrays to YAML', () => {
    expect(jsonToYamlLogic.transform('{"a":1,"b":[1,2]}')).toBe('a: 1\nb:\n  - 1\n  - 2\n');
  });
  it('nests mappings with indentation', () => {
    const yaml = jsonToYamlLogic.transform('{"outer":{"inner":"hello"}}');
    expect(yaml).toContain('outer:');
    expect(yaml).toContain('inner: hello');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToYamlLogic.transform('{bad}')).toThrow();
  });
});

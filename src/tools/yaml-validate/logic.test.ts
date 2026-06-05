import { describe, it, expect } from 'vitest';
import { yamlValidateLogic } from './logic';

describe('yamlValidate', () => {
  it('accepts valid YAML', () => {
    expect(yamlValidateLogic.transform('a: 1\nb: 2')).toMatch(/valid/i);
  });
  it('throws on invalid YAML with inconsistent indentation', () => {
    expect(() => yamlValidateLogic.transform('a:\n - 1\n- 2')).toThrow();
  });
  it('throws on duplicate-ish broken syntax', () => {
    expect(() => yamlValidateLogic.transform('foo: [1, 2')).toThrow();
  });
});

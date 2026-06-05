import { describe, it, expect } from 'vitest';
import { jsonToEnvLogic } from './logic';

describe('jsonToEnv', () => {
  it('writes KEY=VALUE lines', () => {
    expect(jsonToEnvLogic.transform('{"A":1,"B":"hello"}')).toBe('A=1\nB=hello');
  });
  it('quotes values with spaces', () => {
    expect(jsonToEnvLogic.transform('{"A":"hello world"}')).toBe('A="hello world"');
  });
  it('serializes nested objects as JSON', () => {
    expect(jsonToEnvLogic.transform('{"A":{"x":1}}')).toContain('A=');
  });
  it('throws on a non-object root', () => {
    expect(() => jsonToEnvLogic.transform('[1,2]')).toThrow();
  });
});

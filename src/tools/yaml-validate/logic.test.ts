import { describe, it, expect } from 'vitest';
import { yamlValidateLogic } from './logic';

const ctx = { options: {}, secondary: '' };

describe('yamlValidate', () => {
  // --- happy paths ---
  it('accepts a valid mapping', () => {
    expect(yamlValidateLogic.transform('a: 1\nb: 2')).toMatch(/valid/i);
  });

  it('returns the exact success message', () => {
    expect(yamlValidateLogic.transform('a: 1')).toBe('✓ Valid YAML.');
  });

  it('accepts a nested mapping', () => {
    expect(yamlValidateLogic.transform('a:\n  b:\n    c: 1')).toBe('✓ Valid YAML.');
  });

  it('accepts a flow sequence', () => {
    expect(yamlValidateLogic.transform('items: [1, 2, 3]')).toBe('✓ Valid YAML.');
  });

  it('accepts a block sequence', () => {
    expect(yamlValidateLogic.transform('- one\n- two\n- three')).toBe('✓ Valid YAML.');
  });

  it('accepts a bare scalar', () => {
    expect(yamlValidateLogic.transform('hello')).toBe('✓ Valid YAML.');
  });

  it('accepts a null tilde value', () => {
    expect(yamlValidateLogic.transform('~')).toBe('✓ Valid YAML.');
  });

  // --- edge cases that js-yaml treats as valid (load returns undefined / value) ---
  it('treats an empty string as valid', () => {
    expect(yamlValidateLogic.transform('')).toBe('✓ Valid YAML.');
  });

  it('treats whitespace-only input as valid', () => {
    expect(yamlValidateLogic.transform('   \n  \n')).toBe('✓ Valid YAML.');
  });

  it('treats a comment-only document as valid', () => {
    expect(yamlValidateLogic.transform('# just a comment')).toBe('✓ Valid YAML.');
  });

  it('accepts unicode and emoji values', () => {
    expect(yamlValidateLogic.transform('greet: 👋 héllo wörld')).toBe('✓ Valid YAML.');
  });

  it('accepts a large valid document', () => {
    const big = Array.from({ length: 500 }, (_, i) => `key${i}: value${i}`).join('\n');
    expect(yamlValidateLogic.transform(big)).toBe('✓ Valid YAML.');
  });

  it('ignores extra context arguments (options/secondary unused)', () => {
    expect(yamlValidateLogic.transform('a: 1', ctx)).toBe('✓ Valid YAML.');
  });

  it('exposes no options and no secondary input', () => {
    expect(yamlValidateLogic.options).toBeUndefined();
    expect(yamlValidateLogic.secondary).toBeUndefined();
  });

  // --- error paths ---
  it('throws on inconsistent indentation', () => {
    expect(() => yamlValidateLogic.transform('a:\n - 1\n- 2')).toThrow();
  });

  it('throws on an unterminated flow sequence', () => {
    expect(() => yamlValidateLogic.transform('foo: [1, 2')).toThrow();
  });

  it('throws on duplicate mapping keys', () => {
    expect(() => yamlValidateLogic.transform('a: 1\na: 2')).toThrow();
  });

  it('throws on tab characters used for indentation', () => {
    expect(() => yamlValidateLogic.transform('a:\n\t- 1')).toThrow();
  });

  it('throws on a multi-document stream (load expects a single document)', () => {
    expect(() => yamlValidateLogic.transform('a: 1\n---\nb: 2')).toThrow();
  });
});

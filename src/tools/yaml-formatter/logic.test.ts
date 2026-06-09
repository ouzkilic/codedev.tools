import { describe, it, expect } from 'vitest';
import { yamlFormatterLogic } from './logic';

describe('yamlFormatterLogic', () => {
  it('normalizes spacing between keys and values', () => {
    expect(yamlFormatterLogic.transform('a:    1\nb:   2')).toBe('a: 1\nb: 2\n');
  });

  it('round-trips nested mappings', () => {
    const out = yamlFormatterLogic.transform('x:\n  name: 1');
    expect(out).toContain('x:');
    expect(out).toContain('name: 1');
  });

  it('uses 2-space indentation for nested structures', () => {
    const out = yamlFormatterLogic.transform('parent:\n  child:\n    leaf: 1');
    expect(out).toContain('  child:');
    expect(out).toContain('    leaf: 1');
  });

  it('throws on invalid YAML', () => {
    expect(() => yamlFormatterLogic.transform('a:\n - 1\n- 2')).toThrow();
  });

  it('returns an empty string for empty input', () => {
    expect(yamlFormatterLogic.transform('')).toBe('');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(yamlFormatterLogic.transform('   ')).toBe('');
  });

  it('always appends a trailing newline', () => {
    expect(yamlFormatterLogic.transform('a: 1')).toMatch(/\n$/);
  });

  it('formats a top-level scalar string', () => {
    expect(yamlFormatterLogic.transform('hello')).toBe('hello\n');
  });

  it('formats a top-level number', () => {
    expect(yamlFormatterLogic.transform('42')).toBe('42\n');
  });

  it('formats an explicit null', () => {
    expect(yamlFormatterLogic.transform('null')).toBe('null\n');
  });

  it('converts a flow-style mapping into block style', () => {
    expect(yamlFormatterLogic.transform('{a: 1, b: 2}')).toBe('a: 1\nb: 2\n');
  });

  it('converts a flow-style sequence into block style', () => {
    expect(yamlFormatterLogic.transform('[1, 2, 3]')).toBe('- 1\n- 2\n- 3\n');
  });

  it('preserves block-style sequences', () => {
    expect(yamlFormatterLogic.transform('- a\n- b')).toBe('- a\n- b\n');
  });

  it('preserves unicode and emoji content', () => {
    const out = yamlFormatterLogic.transform('emoji: 🎉\nname: café');
    expect(out).toContain('🎉');
    expect(out).toContain('café');
  });

  it('quotes ambiguous boolean-like strings to keep them strings', () => {
    expect(yamlFormatterLogic.transform('flag: yes')).toBe("flag: 'yes'\n");
  });

  it('strips redundant quotes from plain scalar values', () => {
    expect(yamlFormatterLogic.transform('s: "already quoted"')).toBe('s: already quoted\n');
  });

  it('does not wrap long scalar values onto multiple lines', () => {
    const long = 'word '.repeat(40).trim();
    const out = yamlFormatterLogic.transform(`text: ${long}`);
    const lines = out.replace(/\n$/, '').split('\n');
    expect(lines).toHaveLength(1);
    expect(out).toContain(long);
  });

  it('resolves anchors and aliases to concrete values', () => {
    const out = yamlFormatterLogic.transform('a: &x 1\nb: *x');
    expect(out).toContain('a: 1');
    expect(out).toContain('b: 1');
  });

  it('is idempotent on already-formatted output', () => {
    const once = yamlFormatterLogic.transform('{a: 1, b: [2, 3]}');
    const twice = yamlFormatterLogic.transform(once);
    expect(twice).toBe(once);
  });

  it('throws on tab characters used for indentation', () => {
    expect(() => yamlFormatterLogic.transform('a:\n\tb: 1')).toThrow();
  });

  it('throws on a multi-document stream', () => {
    expect(() => yamlFormatterLogic.transform('---\na: 1\n---\nb: 2')).toThrow();
  });

  it('handles large inputs with many keys', () => {
    const input = Array.from({ length: 500 }, (_, i) => `key${i}: ${i}`).join('\n');
    const out = yamlFormatterLogic.transform(input);
    expect(out).toContain('key0: 0');
    expect(out).toContain('key499: 499');
    expect(out.trimEnd().split('\n')).toHaveLength(500);
  });
});

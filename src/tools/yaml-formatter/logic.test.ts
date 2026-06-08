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
});

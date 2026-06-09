import { describe, it, expect } from 'vitest';
import { yamlToTomlLogic } from './logic';

describe('yamlToTomlLogic', () => {
  it('converts a simple scalar mapping', () => {
    expect(yamlToTomlLogic.transform('title: x')).toContain('title = "x"');
  });

  it('converts a nested mapping into a table', () => {
    const out = yamlToTomlLogic.transform('owner:\n  name: Ada');
    expect(out).toContain('[owner]');
    expect(out).toContain('name = "Ada"');
  });

  it('converts numeric values', () => {
    expect(yamlToTomlLogic.transform('port: 8080')).toContain('port = 8080');
  });

  it('throws on a top-level list', () => {
    expect(() => yamlToTomlLogic.transform('- 1\n- 2')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws on a bare scalar', () => {
    expect(() => yamlToTomlLogic.transform('hello')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws on a bare boolean scalar', () => {
    expect(() => yamlToTomlLogic.transform('true')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws on a bare numeric scalar', () => {
    expect(() => yamlToTomlLogic.transform('42')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws on empty input (loads as undefined)', () => {
    expect(() => yamlToTomlLogic.transform('')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws on whitespace-only input (loads as undefined)', () => {
    expect(() => yamlToTomlLogic.transform('   \n  ')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws the custom message on a top-level null document', () => {
    // `null` (or `~`) loads to JS null, which the guard rejects.
    expect(() => yamlToTomlLogic.transform('null')).toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('throws a parser error (not the custom message) on malformed YAML', () => {
    expect(() => yamlToTomlLogic.transform('key: "unterminated')).toThrow();
    expect(() => yamlToTomlLogic.transform('key: "unterminated')).not.toThrow(
      'YAML must describe a top-level mapping for TOML.',
    );
  });

  it('renders boolean values without quotes', () => {
    const out = yamlToTomlLogic.transform('enabled: true\ndisabled: false');
    expect(out).toContain('enabled = true');
    expect(out).toContain('disabled = false');
  });

  it('renders float values', () => {
    expect(yamlToTomlLogic.transform('pi: 3.14')).toContain('pi = 3.14');
  });

  it('renders an inline array for a list-valued key', () => {
    const out = yamlToTomlLogic.transform('list:\n  - 1\n  - 2\n  - 3');
    expect(out).toContain('list = [');
    expect(out).toContain('1');
    expect(out).toContain('2');
    expect(out).toContain('3');
  });

  it('renders an array of tables for a list of mappings', () => {
    const out = yamlToTomlLogic.transform('items:\n  - id: 1\n  - id: 2');
    expect(out).toContain('[[items]]');
    expect(out).toContain('id = 1');
    expect(out).toContain('id = 2');
  });

  it('preserves unicode and emoji in string values', () => {
    const out = yamlToTomlLogic.transform('greet: "héllo 😀"');
    expect(out).toContain('héllo 😀');
  });

  it('quotes keys that contain dots', () => {
    const out = yamlToTomlLogic.transform('"k.k": 1');
    expect(out).toContain('"k.k" = 1');
  });

  it('emits multiple top-level keys, each on its own line', () => {
    const out = yamlToTomlLogic.transform('a: 1\nb: 2\nc: 3');
    expect(out).toContain('a = 1');
    expect(out).toContain('b = 2');
    expect(out).toContain('c = 3');
  });

  it('handles an empty mapping (no key/value lines)', () => {
    const out = yamlToTomlLogic.transform('{}');
    expect(typeof out).toBe('string');
    expect(out).not.toContain('=');
  });

  it('omits keys whose value is null (smol-toml drops them)', () => {
    // {x: null} is a valid object and passes the guard, but TOML has no null,
    // so the key is not emitted.
    const out = yamlToTomlLogic.transform('x: null');
    expect(out).not.toContain('x =');
  });

  it('handles a deeply nested mapping with multiple leaves', () => {
    const out = yamlToTomlLogic.transform('a:\n b: 1\n c: 2');
    expect(out).toContain('[a]');
    expect(out).toContain('b = 1');
    expect(out).toContain('c = 2');
  });

  it('handles a large flat mapping', () => {
    const lines = Array.from({ length: 200 }, (_, i) => `k${i}: ${i}`).join('\n');
    const out = yamlToTomlLogic.transform(lines);
    expect(out).toContain('k0 = 0');
    expect(out).toContain('k199 = 199');
  });
});

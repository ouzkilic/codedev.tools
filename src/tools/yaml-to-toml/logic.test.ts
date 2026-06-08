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
});

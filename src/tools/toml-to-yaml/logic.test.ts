import { describe, it, expect } from 'vitest';
import { tomlToYamlLogic } from './logic';

describe('tomlToYamlLogic', () => {
  it('converts a simple key/value', () => {
    expect(tomlToYamlLogic.transform('title = "x"')).toBe('title: x\n');
  });

  it('converts a table into nested YAML', () => {
    const out = tomlToYamlLogic.transform('[owner]\nname = "Ada"');
    expect(out).toContain('owner:');
    expect(out).toContain('name: Ada');
  });

  it('converts numbers and booleans', () => {
    const out = tomlToYamlLogic.transform('count = 3\nenabled = true');
    expect(out).toContain('count: 3');
    expect(out).toContain('enabled: true');
  });

  it('returns empty string for empty input', () => {
    expect(tomlToYamlLogic.transform('   ')).toBe('');
  });

  it('throws on invalid TOML', () => {
    expect(() => tomlToYamlLogic.transform('= bad')).toThrow();
  });
});

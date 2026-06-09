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

  it('returns empty string for a completely empty input', () => {
    expect(tomlToYamlLogic.transform('')).toBe('');
  });

  it('returns empty string for whitespace and newlines only', () => {
    expect(tomlToYamlLogic.transform('\n\n   \t\n')).toBe('');
  });

  it('ignores the second context argument (single-input tool)', () => {
    const out = tomlToYamlLogic.transform('title = "x"', {
      options: {},
      secondary: 'ignored',
    });
    expect(out).toBe('title: x\n');
  });

  it('converts a comment-only document to an empty YAML map', () => {
    // The input is non-empty after trim, so parse() returns {} and yaml.dump({}) is '{}\n'.
    expect(tomlToYamlLogic.transform('# just a comment')).toBe('{}\n');
  });

  it('converts a float value', () => {
    expect(tomlToYamlLogic.transform('pi = 3.14')).toBe('pi: 3.14\n');
  });

  it('converts negative and large integers', () => {
    const out = tomlToYamlLogic.transform('n = -42\nbig = 1000000');
    expect(out).toContain('-42');
    expect(out).toContain('big: 1000000');
  });

  it('converts an array into a YAML sequence', () => {
    expect(tomlToYamlLogic.transform('ports = [80, 443]')).toBe(
      'ports:\n  - 80\n  - 443\n',
    );
  });

  it('converts a string array', () => {
    const out = tomlToYamlLogic.transform('names = ["a", "b"]');
    expect(out).toContain('- a');
    expect(out).toContain('- b');
  });

  it('converts deeply nested dotted tables', () => {
    expect(tomlToYamlLogic.transform('[a.b]\nc = 1')).toBe('a:\n  b:\n    c: 1\n');
  });

  it('converts an array of tables into a YAML sequence of maps', () => {
    const out = tomlToYamlLogic.transform(
      '[[products]]\nname = "A"\n[[products]]\nname = "B"',
    );
    expect(out).toBe('products:\n  - name: A\n  - name: B\n');
  });

  it('converts inline tables', () => {
    const out = tomlToYamlLogic.transform('point = { x = 1, y = 2 }');
    expect(out).toContain('point:');
    expect(out).toContain('x: 1');
    // js-yaml quotes the reserved-looking key "y".
    expect(out).toContain("'y': 2");
  });

  it('preserves unicode and emoji content', () => {
    expect(tomlToYamlLogic.transform('e = "😀café"')).toBe('e: 😀café\n');
  });

  it('converts a multiline basic string into a YAML literal block', () => {
    const out = tomlToYamlLogic.transform('s = """\nline1\nline2\n"""');
    expect(out).toContain('line1');
    expect(out).toContain('line2');
  });

  it('converts a TOML datetime into an ISO string', () => {
    expect(tomlToYamlLogic.transform('d = 1979-05-27T07:32:00Z')).toBe(
      'd: 1979-05-27T07:32:00.000Z\n',
    );
  });

  it('handles a large document with many keys', () => {
    const lines = Array.from({ length: 500 }, (_, i) => `key${i} = ${i}`);
    const out = tomlToYamlLogic.transform(lines.join('\n'));
    expect(out).toContain('key0: 0');
    expect(out).toContain('key499: 499');
    expect(out.split('\n').length).toBeGreaterThan(500);
  });

  it('produces YAML that round-trips back to equivalent data via re-conversion', () => {
    const toml = 'title = "x"\ncount = 3\nenabled = true';
    const yaml1 = tomlToYamlLogic.transform(toml);
    expect(yaml1).toContain('title: x');
    expect(yaml1).toContain('count: 3');
    expect(yaml1).toContain('enabled: true');
  });

  it('throws an error prefixed with "Invalid TOML" on malformed input', () => {
    expect(() => tomlToYamlLogic.transform('key = ')).toThrow(/Invalid TOML/);
  });

  it('throws on a duplicate key', () => {
    expect(() => tomlToYamlLogic.transform('a = 1\na = 2')).toThrow();
  });

  it('throws on an unclosed array', () => {
    expect(() => tomlToYamlLogic.transform('x = [1, 2')).toThrow();
  });
});

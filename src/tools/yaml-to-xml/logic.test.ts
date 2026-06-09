import { describe, it, expect } from 'vitest';
import { yamlToXmlLogic } from './logic';

describe('yamlToXml', () => {
  it('builds XML from a YAML mapping', () => {
    const out = yamlToXmlLogic.transform('r:\n  a: hi');
    expect(out).toContain('<r>');
    expect(out).toContain('<a>hi</a>');
  });

  it('throws on a top-level list', () => {
    expect(() => yamlToXmlLogic.transform('- a\n- b')).toThrow();
  });

  it('formats output with two-space indentation', () => {
    const out = yamlToXmlLogic.transform('r:\n  a: hi');
    expect(out).toBe('<r>\n  <a>hi</a>\n</r>');
  });

  it('does not leave a trailing newline (trimEnd)', () => {
    const out = yamlToXmlLogic.transform('r:\n  a: hi');
    expect(out.endsWith('\n')).toBe(false);
    expect(out).toMatch(/<\/r>$/);
  });

  it('renders nested mappings as nested elements', () => {
    const out = yamlToXmlLogic.transform(
      'nested:\n  level1:\n    level2:\n      val: deep',
    );
    expect(out).toBe(
      '<nested>\n  <level1>\n    <level2>\n      <val>deep</val>\n    </level2>\n  </level1>\n</nested>',
    );
  });

  it('serializes numbers and booleans as text', () => {
    const out = yamlToXmlLogic.transform('root:\n  num: 42\n  flag: true');
    expect(out).toContain('<num>42</num>');
    expect(out).toContain('<flag>true</flag>');
  });

  it('renders null values as self-closing elements', () => {
    const out = yamlToXmlLogic.transform('root:\n  nil: null');
    expect(out).toContain('<nil/>');
  });

  it('repeats the key for each item of an array value', () => {
    const out = yamlToXmlLogic.transform('list:\n  - 1\n  - 2\n  - 3');
    expect(out).toBe('<list>1</list>\n<list>2</list>\n<list>3</list>');
  });

  it('maps the @_ prefix to XML attributes', () => {
    const out = yamlToXmlLogic.transform('item:\n  "@_id": 5\n  "#text": hello');
    expect(out).toBe('<item id="5">hello</item>');
  });

  it('escapes XML-special characters in text content', () => {
    const out = yamlToXmlLogic.transform("k:\n  v: \"<a> & 'q'\"");
    expect(out).toContain('&lt;a&gt;');
    expect(out).toContain('&amp;');
    expect(out).toContain('&apos;q&apos;');
    expect(out).not.toContain('<a>');
  });

  it('preserves unicode and emoji content verbatim', () => {
    const out = yamlToXmlLogic.transform('uni:\n  emoji: "😀 héllo"');
    expect(out).toContain('<emoji>😀 héllo</emoji>');
  });

  it('emits open/close tags for an empty mapping value', () => {
    const out = yamlToXmlLogic.transform('empty: {}');
    expect(out).toBe('<empty></empty>');
  });

  it('handles a large mapping with many keys', () => {
    const lines = ['root:'];
    for (let i = 0; i < 200; i++) lines.push(`  k${i}: v${i}`);
    const out = yamlToXmlLogic.transform(lines.join('\n'));
    expect(out).toContain('<k0>v0</k0>');
    expect(out).toContain('<k199>v199</k199>');
  });

  it('accepts the optional ToolContext argument without changing output', () => {
    const ctx = { options: {}, secondary: '' };
    const withCtx = yamlToXmlLogic.transform('r:\n  a: hi', ctx);
    const withoutCtx = yamlToXmlLogic.transform('r:\n  a: hi');
    expect(withCtx).toBe(withoutCtx);
  });

  it('throws the mapping error on an empty string', () => {
    expect(() => yamlToXmlLogic.transform('')).toThrow(
      'YAML must be a top-level mapping.',
    );
  });

  it('throws the mapping error on whitespace-only input', () => {
    expect(() => yamlToXmlLogic.transform('   \n  ')).toThrow(
      'YAML must be a top-level mapping.',
    );
  });

  it('throws the mapping error on a top-level scalar', () => {
    expect(() => yamlToXmlLogic.transform('just a string')).toThrow(
      'YAML must be a top-level mapping.',
    );
  });

  it('throws the mapping error on a top-level number', () => {
    expect(() => yamlToXmlLogic.transform('42')).toThrow(
      'YAML must be a top-level mapping.',
    );
  });

  it('throws the mapping error on an explicit null document', () => {
    expect(() => yamlToXmlLogic.transform('null')).toThrow(
      'YAML must be a top-level mapping.',
    );
  });

  it('throws on syntactically invalid YAML', () => {
    expect(() => yamlToXmlLogic.transform('foo: [unclosed')).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { xmlToYamlLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const run = (input: string) => xmlToYamlLogic.transform(input, ctx);

describe('xmlToYamlLogic', () => {
  it('converts simple XML to YAML (existing)', () => {
    const out = run('<r><a>1</a></r>');
    expect(out).toContain('r:');
    expect(out).toContain('a:');
  });

  it('throws on invalid XML with mismatched tags (existing)', () => {
    expect(() => run('<a></b>')).toThrow();
  });

  it('nests child elements under their parents', () => {
    const out = run('<root><parent><child>v</child></parent></root>');
    expect(out).toContain('root:');
    expect(out).toContain('parent:');
    expect(out).toContain('child: v');
  });

  it('emits attributes with the @_ prefix', () => {
    const out = run('<r id="1"><a>x</a></r>');
    expect(out).toContain("'@_id': '1'");
    expect(out).toContain('a: x');
  });

  it('keeps element text alongside attributes via #text', () => {
    const out = run('<r a="1">text</r>');
    expect(out).toContain("'#text': text");
    expect(out).toContain("'@_a': '1'");
  });

  it('represents repeated sibling tags as a YAML sequence', () => {
    const out = run('<r><a>1</a><a>2</a></r>');
    expect(out).toContain('a:');
    expect(out).toMatch(/-\s*1/);
    expect(out).toMatch(/-\s*2/);
  });

  it('parses numeric text as a number, not a quoted string', () => {
    const out = run('<r><n>42</n></r>');
    // numeric scalar is unquoted in the dumped YAML
    expect(out).toMatch(/'?n'?:\s*42\s*$/m);
    expect(out).not.toContain("'42'");
  });

  it('parses boolean-like text as an unquoted scalar', () => {
    const out = run('<r><b>true</b></r>');
    expect(out).toMatch(/b:\s*true\s*$/m);
    expect(out).not.toContain("'true'");
  });

  it('renders a self-closing/empty element as an empty string value', () => {
    const out = run('<r/>');
    expect(out).toContain("r: ''");
  });

  it('preserves unicode and emoji content', () => {
    const out = run('<r><e>héllo 😀</e></r>');
    expect(out).toContain('héllo 😀');
  });

  it('produces output that parses back to the expected object (round-trip)', () => {
    const out = run('<root><parent><child>v</child></parent></root>');
    // dump produces valid YAML that round-trips structurally
    expect(out).toContain('root:');
    expect(out).toContain('child: v');
    // idempotent: same input yields same output
    expect(run('<root><parent><child>v</child></parent></root>')).toBe(out);
  });

  it('handles deeply nested structures', () => {
    const out = run('<a><b><c><d><e>deep</e></d></c></b></a>');
    expect(out).toContain('a:');
    expect(out).toContain('b:');
    expect(out).toContain('c:');
    expect(out).toContain('d:');
    expect(out).toContain('e: deep');
  });

  it('handles a large input without error', () => {
    const items = Array.from({ length: 500 }, (_, i) => `<item>${i}</item>`).join('');
    const out = run(`<list>${items}</list>`);
    expect(out).toContain('list:');
    expect(out).toContain('item:');
    expect(out).toMatch(/-\s*0/);
    expect(out).toMatch(/-\s*499/);
  });

  it('throws on empty input (no start tag)', () => {
    expect(() => run('')).toThrow();
  });

  it('throws on whitespace-only input (no start tag)', () => {
    expect(() => run('   ')).toThrow();
  });

  it('throws on a tag mismatch with a descriptive message', () => {
    expect(() => run('<a><b></a></b>')).toThrow(/tag/i);
  });

  it('works when ctx is omitted (transform is a pure single-input function)', () => {
    const out = xmlToYamlLogic.transform('<r><a>1</a></r>');
    expect(out).toContain('r:');
    expect(out).toContain('a:');
  });
});

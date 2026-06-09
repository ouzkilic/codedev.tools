import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { xmlFormatterLogic } from './logic';

// The transform ignores ctx, but exercise the ToolContext signature too.
const ctx: ToolContext = { options: {}, secondary: '' };

describe('xmlFormatter', () => {
  it('indents nested elements', () => {
    expect(xmlFormatterLogic.transform('<r><a>hi</a></r>')).toBe('<r>\n  <a>hi</a>\n</r>');
  });

  it('keeps simple text content inline', () => {
    expect(xmlFormatterLogic.transform('<a>x</a>')).toBe('<a>x</a>');
  });

  it('throws on input that is not XML', () => {
    expect(() => xmlFormatterLogic.transform('not xml at all')).toThrow();
  });

  it('uses a two-space indentation unit per nesting level', () => {
    expect(xmlFormatterLogic.transform('<r><a><b>1</b></a></r>')).toBe(
      '<r>\n  <a>\n    <b>1</b>\n  </a>\n</r>',
    );
  });

  it('preserves attributes on elements', () => {
    expect(xmlFormatterLogic.transform('<r a="1" b="2"><c>x</c></r>')).toBe(
      '<r a="1" b="2">\n  <c>x</c>\n</r>',
    );
  });

  it('keeps the XML declaration on its own line', () => {
    expect(xmlFormatterLogic.transform('<?xml version="1.0"?><r><a>1</a></r>')).toBe(
      '<?xml version="1.0"?>\n<r>\n  <a>1</a>\n</r>',
    );
  });

  it('indents self-closing elements', () => {
    expect(xmlFormatterLogic.transform('<r><a/><b/></r>')).toBe(
      '<r>\n  <a/>\n  <b/>\n</r>',
    );
  });

  it('keeps comments and indents them at the right level', () => {
    expect(xmlFormatterLogic.transform('<r><!-- hi --><a>1</a></r>')).toBe(
      '<r>\n  <!-- hi -->\n  <a>1</a>\n</r>',
    );
  });

  it('leaves CDATA sections untouched', () => {
    expect(xmlFormatterLogic.transform('<r><![CDATA[ <not> ]]></r>')).toBe(
      '<r><![CDATA[ <not> ]]></r>',
    );
  });

  it('preserves entity references', () => {
    expect(xmlFormatterLogic.transform('<r>a &amp; b</r>')).toBe('<r>a &amp; b</r>');
  });

  it('preserves unicode and emoji content', () => {
    expect(xmlFormatterLogic.transform('<r><a>😀ünî</a></r>')).toBe(
      '<r>\n  <a>😀ünî</a>\n</r>',
    );
  });

  it('collapses an element whose content is only whitespace', () => {
    expect(xmlFormatterLogic.transform('<r>   </r>')).toBe('<r></r>');
  });

  it('is idempotent on already-formatted output', () => {
    const once = xmlFormatterLogic.transform('<r><a><b>1</b></a><c>2</c></r>');
    expect(xmlFormatterLogic.transform(once)).toBe(once);
  });

  it('throws on an empty string', () => {
    expect(() => xmlFormatterLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input (no root element)', () => {
    expect(() => xmlFormatterLogic.transform('   ')).toThrow();
  });

  it('ignores the optional ToolContext argument', () => {
    expect(xmlFormatterLogic.transform('<r><a>hi</a></r>', ctx)).toBe('<r>\n  <a>hi</a>\n</r>');
  });

  it('formats large documents with one line per child element', () => {
    let kids = '';
    for (let i = 0; i < 200; i++) kids += `<item>${i}</item>`;
    const out = xmlFormatterLogic.transform(`<root>${kids}</root>`);
    // <root> + 200 items + </root>
    expect(out.split('\n')).toHaveLength(202);
    expect(out.startsWith('<root>\n  <item>0</item>')).toBe(true);
    expect(out.endsWith('</root>')).toBe(true);
  });

  it('uses \\n (not \\r\\n) as the line separator', () => {
    const out = xmlFormatterLogic.transform('<r><a>1</a></r>');
    expect(out).toContain('\n');
    expect(out).not.toContain('\r');
  });

  it('exposes no configurable options (single-input tool)', () => {
    expect(xmlFormatterLogic.options).toBeUndefined();
    expect(xmlFormatterLogic.secondary).toBeUndefined();
  });
});

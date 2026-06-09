import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { xmlMinifyLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };

describe('xmlMinify', () => {
  it('removes whitespace between tags', () => {
    expect(xmlMinifyLogic.transform('<r>\n  <a>hi</a>\n</r>')).toBe('<r><a>hi</a></r>');
  });

  it('ignores the ToolContext (options/secondary) and produces the same result', () => {
    expect(xmlMinifyLogic.transform('<r>\n  <a>hi</a>\n</r>', ctx)).toBe('<r><a>hi</a></r>');
    expect(xmlMinifyLogic.transform('<r>\n  <a>hi</a>\n</r>', { options: { foo: 'bar' }, secondary: 'ignored' })).toBe(
      '<r><a>hi</a></r>',
    );
  });

  it('preserves the XML declaration and strips surrounding whitespace', () => {
    const input = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <a>1</a>\n</root>';
    expect(xmlMinifyLogic.transform(input)).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><root><a>1</a></root>',
    );
  });

  it('normalizes extra whitespace inside the start tag and between attributes', () => {
    expect(xmlMinifyLogic.transform('<root  a="1"   b="2" >\n  <x/>\n</root>')).toBe(
      '<root a="1" b="2"><x/></root>',
    );
  });

  it('keeps comments but removes whitespace around them', () => {
    expect(xmlMinifyLogic.transform('<root>\n  <!-- comment -->\n  <a>1</a>\n</root>')).toBe(
      '<root><!-- comment --><a>1</a></root>',
    );
  });

  it('preserves CDATA content verbatim, including internal spaces', () => {
    expect(xmlMinifyLogic.transform('<root>\n  <a><![CDATA[ keep  spaces ]]></a>\n</root>')).toBe(
      '<root><a><![CDATA[ keep  spaces ]]></a></root>',
    );
  });

  it('preserves unicode and emoji text content', () => {
    expect(xmlMinifyLogic.transform('<root>\n  <emoji>😀 héllo</emoji>\n</root>')).toBe(
      '<root><emoji>😀 héllo</emoji></root>',
    );
  });

  it('preserves text content whitespace inside a leaf element', () => {
    // collapseContent only collapses indentation between tags, not leaf text runs.
    expect(xmlMinifyLogic.transform('<p>  hello   world  </p>')).toBe('<p>  hello   world  </p>');
  });

  it('preserves mixed content (text interleaved with inline tags)', () => {
    expect(xmlMinifyLogic.transform('<p>Hello <b>world</b>!</p>')).toBe('<p>Hello <b>world</b>!</p>');
  });

  it('normalizes self-closing tags, dropping the space before />', () => {
    expect(xmlMinifyLogic.transform('<root>\n  <br/>\n  <hr />\n</root>')).toBe('<root><br/><hr/></root>');
  });

  it('preserves entity references unchanged', () => {
    expect(xmlMinifyLogic.transform('<root>\n  <a>a &amp; b &lt; c</a>\n</root>')).toBe(
      '<root><a>a &amp; b &lt; c</a></root>',
    );
  });

  it('preserves whitespace inside attribute values', () => {
    expect(xmlMinifyLogic.transform('<a x="  spaced  "/>')).toBe('<a x="  spaced  "/>');
  });

  it('collapses deeply nested indentation', () => {
    expect(xmlMinifyLogic.transform('<a>\n <b>\n  <c>x</c>\n </b>\n</a>')).toBe('<a><b><c>x</c></b></a>');
  });

  it('is idempotent on already-minified XML', () => {
    const minified = '<r><a>hi</a></r>';
    expect(xmlMinifyLogic.transform(minified)).toBe(minified);
    expect(xmlMinifyLogic.transform(xmlMinifyLogic.transform(minified))).toBe(minified);
  });

  it('round-trips: minifying the output of a minify yields the same string', () => {
    const once = xmlMinifyLogic.transform('<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
    expect(xmlMinifyLogic.transform(once)).toBe(once);
  });

  it('handles a large input without losing element count', () => {
    const items = Array.from({ length: 500 }, (_, i) => `\n  <item id="${i}">v${i}</item>`).join('');
    const input = `<list>${items}\n</list>`;
    const out = xmlMinifyLogic.transform(input);
    expect(out.startsWith('<list>')).toBe(true);
    expect(out.endsWith('</list>')).toBe(true);
    expect(out).not.toContain('\n');
    expect((out.match(/<item /g) ?? []).length).toBe(500);
    expect(out).toContain('<item id="499">v499</item>');
  });

  it('throws on empty input', () => {
    expect(() => xmlMinifyLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => xmlMinifyLogic.transform('   \n  \t ')).toThrow();
  });

  it('throws on input that is not XML', () => {
    expect(() => xmlMinifyLogic.transform('not xml at all')).toThrow();
  });
});

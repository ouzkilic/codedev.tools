import { describe, it, expect } from 'vitest';
import { jsonToXmlLogic } from './logic';

describe('jsonToXml', () => {
  it('builds nested XML from a JSON object', () => {
    expect(jsonToXmlLogic.transform('{"r":{"a":"hi"}}')).toBe('<r>\n  <a>hi</a>\n</r>');
  });

  it('writes @_ keys as attributes', () => {
    expect(jsonToXmlLogic.transform('{"a":{"#text":"hi","@_x":"1"}}')).toBe('<a x="1">hi</a>');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToXmlLogic.transform('{bad}')).toThrow();
  });

  it('throws on empty string input', () => {
    expect(() => jsonToXmlLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => jsonToXmlLogic.transform('   \n\t  ')).toThrow();
  });

  it('throws on truncated JSON', () => {
    expect(() => jsonToXmlLogic.transform('{"a":')).toThrow();
  });

  it('throws on trailing comma', () => {
    expect(() => jsonToXmlLogic.transform('{"a":"b",}')).toThrow();
  });

  it('serializes a numeric value', () => {
    expect(jsonToXmlLogic.transform('{"n":42}')).toBe('<n>42</n>');
  });

  it('serializes a negative number and zero', () => {
    expect(jsonToXmlLogic.transform('{"neg":-7}')).toBe('<neg>-7</neg>');
    expect(jsonToXmlLogic.transform('{"z":0}')).toBe('<z>0</z>');
  });

  it('serializes a boolean value', () => {
    expect(jsonToXmlLogic.transform('{"b":true}')).toBe('<b>true</b>');
    expect(jsonToXmlLogic.transform('{"b":false}')).toBe('<b>false</b>');
  });

  it('serializes a null value as a self-closing tag', () => {
    expect(jsonToXmlLogic.transform('{"n":null}')).toBe('<n/>');
  });

  it('serializes an empty string value as open/close tags', () => {
    expect(jsonToXmlLogic.transform('{"a":""}')).toBe('<a></a>');
  });

  it('returns an empty string for an empty object', () => {
    expect(jsonToXmlLogic.transform('{}')).toBe('');
  });

  it('escapes XML special characters in text', () => {
    expect(jsonToXmlLogic.transform('{"s":"<>&"}')).toBe('<s>&lt;&gt;&amp;</s>');
  });

  it('preserves unicode and emoji content', () => {
    expect(jsonToXmlLogic.transform('{"e":"😀"}')).toBe('<e>😀</e>');
    expect(jsonToXmlLogic.transform('{"t":"çğü"}')).toBe('<t>çğü</t>');
  });

  it('expands array values into repeated sibling elements', () => {
    expect(jsonToXmlLogic.transform('{"r":{"item":[1,2,3]}}')).toBe(
      '<r>\n  <item>1</item>\n  <item>2</item>\n  <item>3</item>\n</r>',
    );
  });

  it('handles arrays of objects', () => {
    expect(jsonToXmlLogic.transform('{"list":{"i":[{"x":1},{"x":2}]}}')).toBe(
      '<list>\n  <i>\n    <x>1</x>\n  </i>\n  <i>\n    <x>2</x>\n  </i>\n</list>',
    );
  });

  it('emits multiple top-level keys as sibling elements', () => {
    expect(jsonToXmlLogic.transform('{"a":"1","b":"2"}')).toBe('<a>1</a>\n<b>2</b>');
  });

  it('indents deeply nested structures by two spaces per level', () => {
    expect(jsonToXmlLogic.transform('{"a":{"b":{"c":{"d":"x"}}}}')).toBe(
      '<a>\n  <b>\n    <c>\n      <d>x</d>\n    </c>\n  </b>\n</a>',
    );
  });

  it('combines attributes and text on a nested element', () => {
    expect(jsonToXmlLogic.transform('{"root":{"@_id":"1","child":{"#text":"x","@_k":"v"}}}')).toBe(
      '<root id="1">\n  <child k="v">x</child>\n</root>',
    );
  });

  it('trims trailing whitespace from the output', () => {
    const out = jsonToXmlLogic.transform('{"r":{"a":"hi"}}');
    expect(out).toBe(out.trimEnd());
    expect(out.endsWith('\n')).toBe(false);
  });

  it('is deterministic across repeated calls', () => {
    const input = '{"root":{"@_id":"1","child":{"#text":"x","@_k":"v"}}}';
    expect(jsonToXmlLogic.transform(input)).toBe(jsonToXmlLogic.transform(input));
  });

  it('handles a large object without crashing', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj[`k${i}`] = i;
    const out = jsonToXmlLogic.transform(JSON.stringify({ root: obj }));
    expect(out.startsWith('<root>')).toBe(true);
    expect(out).toContain('<k0>0</k0>');
    expect(out).toContain('<k499>499</k499>');
    expect(out.trimEnd()).toBe(out);
  });

  it('builds an XML document from whitespace-padded valid JSON', () => {
    expect(jsonToXmlLogic.transform('  {"r":{"a":"hi"}}  ')).toBe('<r>\n  <a>hi</a>\n</r>');
  });
});

import { describe, it, expect } from 'vitest';
import { xmlToJsonLogic } from './logic';

const toObj = (s: string) => JSON.parse(xmlToJsonLogic.transform(s));

describe('xmlToJson', () => {
  it('converts elements to nested objects', () => {
    expect(toObj('<r><a>hi</a></r>')).toEqual({ r: { a: 'hi' } });
  });

  it('exposes attributes with @_ prefix', () => {
    expect(toObj('<r><a x="1">hi</a></r>')).toEqual({ r: { a: { '#text': 'hi', '@_x': '1' } } });
  });

  it('throws on malformed XML', () => {
    expect(() => xmlToJsonLogic.transform('<a></b>')).toThrow();
  });

  it('handles deeply nested elements', () => {
    expect(toObj('<r><a><b>x</b></a></r>')).toEqual({ r: { a: { b: 'x' } } });
  });

  it('collapses repeated sibling elements into an array', () => {
    expect(toObj('<r><a>1</a><a>2</a></r>')).toEqual({ r: { a: [1, 2] } });
  });

  it('auto-parses numeric text into numbers', () => {
    expect(toObj('<r><a>42</a></r>')).toEqual({ r: { a: 42 } });
  });

  it('strips leading zeros when parsing numbers', () => {
    expect(toObj('<r>007</r>')).toEqual({ r: 7 });
  });

  it('auto-parses boolean-like text into booleans', () => {
    expect(toObj('<r><a>true</a></r>')).toEqual({ r: { a: true } });
  });

  it('represents self-closing tags as an empty string', () => {
    expect(toObj('<r><a/></r>')).toEqual({ r: { a: '' } });
  });

  it('exposes multiple attributes alongside #text', () => {
    expect(toObj('<r a="1" b="2">x</r>')).toEqual({ r: { '#text': 'x', '@_a': '1', '@_b': '2' } });
  });

  it('keeps an empty attribute value as an empty string', () => {
    expect(toObj('<r x="">v</r>')).toEqual({ r: { '#text': 'v', '@_x': '' } });
  });

  it('returns plain text for a text-only root', () => {
    expect(toObj('<r>plain</r>')).toEqual({ r: 'plain' });
  });

  it('parses the XML declaration into a ?xml key', () => {
    expect(toObj('<?xml version="1.0"?><r>x</r>')).toEqual({
      '?xml': { '@_version': '1.0' },
      r: 'x',
    });
  });

  it('unwraps CDATA section content', () => {
    expect(toObj('<r><![CDATA[a<b>c]]></r>')).toEqual({ r: 'a<b>c' });
  });

  it('ignores XML comments', () => {
    expect(toObj('<r><!-- c -->x</r>')).toEqual({ r: 'x' });
  });

  it('preserves unicode and emoji in text content', () => {
    expect(toObj('<r><a>hi 😀 ünïcode</a></r>')).toEqual({ r: { a: 'hi 😀 ünïcode' } });
  });

  it('produces 2-space indented JSON output', () => {
    expect(xmlToJsonLogic.transform('<r><a>hi</a></r>')).toBe('{\n  "r": {\n    "a": "hi"\n  }\n}');
  });

  it('handles a large document with many repeated nodes', () => {
    let xml = '<root>';
    for (let i = 0; i < 500; i++) xml += `<item id="${i}">val${i}</item>`;
    xml += '</root>';
    const obj = toObj(xml);
    expect(obj.root.item).toHaveLength(500);
    expect(obj.root.item[0]).toEqual({ '#text': 'val0', '@_id': '0' });
    expect(obj.root.item[499]['@_id']).toBe('499');
  });

  it('throws on empty input', () => {
    expect(() => xmlToJsonLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => xmlToJsonLogic.transform('   ')).toThrow();
  });

  it('throws on an unclosed tag', () => {
    expect(() => xmlToJsonLogic.transform('<a>')).toThrow();
  });

  it('surfaces the validator error message when validation fails', () => {
    expect(() => xmlToJsonLogic.transform('<a></b>')).toThrow(/closing tag/i);
  });
});

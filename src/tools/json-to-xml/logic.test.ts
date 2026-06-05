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
});

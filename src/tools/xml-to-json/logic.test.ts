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
});

import { describe, it, expect } from 'vitest';
import { xmlFormatterLogic } from './logic';

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
});

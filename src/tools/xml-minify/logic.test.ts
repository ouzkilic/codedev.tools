import { describe, it, expect } from 'vitest';
import { xmlMinifyLogic } from './logic';

describe('xmlMinify', () => {
  it('removes whitespace between tags', () => {
    expect(xmlMinifyLogic.transform('<r>\n  <a>hi</a>\n</r>')).toBe('<r><a>hi</a></r>');
  });
  it('throws on input that is not XML', () => {
    expect(() => xmlMinifyLogic.transform('not xml at all')).toThrow();
  });
});

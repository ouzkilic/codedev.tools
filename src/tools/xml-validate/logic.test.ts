import { describe, it, expect } from 'vitest';
import { xmlValidateLogic } from './logic';

describe('xmlValidateLogic', () => {
  it('accepts well-formed XML', () => {
    expect(xmlValidateLogic.transform('<a><b>x</b></a>')).toMatch(/valid/i);
  });

  it('accepts XML with attributes', () => {
    expect(xmlValidateLogic.transform('<a id="1"><b>x</b></a>')).toMatch(/valid/i);
  });

  it('throws on mismatched tags', () => {
    expect(() => xmlValidateLogic.transform('<a></b>')).toThrow();
  });

  it('throws on unclosed tag', () => {
    expect(() => xmlValidateLogic.transform('<a>')).toThrow();
  });
});

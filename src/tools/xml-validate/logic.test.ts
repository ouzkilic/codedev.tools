import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { xmlValidateLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };

describe('xmlValidateLogic', () => {
  it('accepts well-formed nested XML', () => {
    expect(xmlValidateLogic.transform('<a><b>x</b></a>')).toMatch(/valid/i);
  });

  it('accepts XML with attributes', () => {
    expect(xmlValidateLogic.transform('<a id="1"><b>x</b></a>')).toMatch(/valid/i);
  });

  it('accepts a self-closing element', () => {
    expect(xmlValidateLogic.transform('<a/>')).toMatch(/valid/i);
  });

  it('accepts an empty paired element', () => {
    expect(xmlValidateLogic.transform('<a></a>')).toMatch(/valid/i);
  });

  it('accepts an XML declaration prolog', () => {
    expect(xmlValidateLogic.transform('<?xml version="1.0"?><a/>')).toMatch(/valid/i);
  });

  it('accepts escaped entities in content', () => {
    expect(xmlValidateLogic.transform('<a>&amp;</a>')).toMatch(/valid/i);
  });

  it('accepts unicode/emoji content', () => {
    expect(xmlValidateLogic.transform('<root><emoji>😀</emoji></root>')).toMatch(/valid/i);
  });

  it('accepts the same name used as sibling and as nested element', () => {
    expect(xmlValidateLogic.transform('<a><a></a></a>')).toMatch(/valid/i);
  });

  it('accepts a large valid document', () => {
    const items = Array.from({ length: 1000 }, (_, i) => `<item id="${i}">v${i}</item>`).join('');
    expect(xmlValidateLogic.transform(`<root>${items}</root>`)).toMatch(/valid/i);
  });

  it('returns the exact success message', () => {
    expect(xmlValidateLogic.transform('<a/>')).toBe('✓ Valid XML.');
  });

  it('ignores the optional context argument', () => {
    expect(xmlValidateLogic.transform('<a/>', ctx)).toBe('✓ Valid XML.');
  });

  it('throws on mismatched tags', () => {
    expect(() => xmlValidateLogic.transform('<a></b>')).toThrow();
  });

  it('throws on an unclosed tag', () => {
    expect(() => xmlValidateLogic.transform('<a>')).toThrow();
  });

  it('throws with the validator closing-tag message on crossed nesting', () => {
    expect(() => xmlValidateLogic.transform('<a><b></a></b>')).toThrow(/closing tag/i);
  });

  it('throws on empty input', () => {
    expect(() => xmlValidateLogic.transform('')).toThrow(/start tag/i);
  });

  it('throws on whitespace-only input', () => {
    expect(() => xmlValidateLogic.transform('   ')).toThrow(/start tag/i);
  });

  it('throws on plain text that is not XML', () => {
    expect(() => xmlValidateLogic.transform('plain text')).toThrow(/not expected/i);
  });

  it('throws on a repeated attribute', () => {
    expect(() => xmlValidateLogic.transform('<a id="1" id="2"/>')).toThrow(/repeated/i);
  });

  it('propagates the validator error message verbatim', () => {
    expect(() => xmlValidateLogic.transform('<a id="1" id="2"/>')).toThrow(
      "Attribute 'id' is repeated.",
    );
  });
});

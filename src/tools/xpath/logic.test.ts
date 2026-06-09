import { describe, it, expect } from 'vitest';
import { xpathLogic } from './logic';

const run = (xml: string, query: string) =>
  xpathLogic.transform(xml, { options: { query }, secondary: '' });

const XML = '<books><book><title>A</title></book><book><title>B</title></book></books>';

describe('xpath', () => {
  it('selects text nodes', () => {
    expect(run(XML, '//title/text()')).toBe('A\nB');
  });

  it('supports count()', () => {
    expect(run(XML, 'count(//book)')).toBe('2');
  });

  it('reports no matches', () => {
    expect(run(XML, '//author')).toBe('No matches.');
  });

  it('returns a hint when no query is given', () => {
    expect(run(XML, '')).toMatch(/enter an xpath/i);
  });

  it('treats a whitespace-only query as empty and returns the hint', () => {
    expect(run(XML, '   ')).toMatch(/enter an xpath/i);
  });

  it('trims surrounding whitespace from the query before evaluating', () => {
    expect(run(XML, '  //title/text()  ')).toBe('A\nB');
  });

  it('exposes a single XPath text option with an empty default', () => {
    expect(xpathLogic.options).toEqual([
      { key: 'query', label: 'XPath', type: 'text', default: '', placeholder: '//book/title/text()' },
    ]);
  });

  it('falls back to the hint when ctx options are missing', () => {
    expect(xpathLogic.transform(XML, undefined)).toMatch(/enter an xpath/i);
  });

  it('returns a boolean expression result as a string ("true")', () => {
    expect(run(XML, 'count(//book) > 1')).toBe('true');
  });

  it('returns a boolean expression result as a string ("false")', () => {
    expect(run(XML, 'count(//book) > 5')).toBe('false');
  });

  it('returns a numeric expression result as a string', () => {
    expect(run(XML, '1 + 2')).toBe('3');
  });

  it('evaluates the string() function on a node-set', () => {
    expect(run(XML, 'string(//title)')).toBe('A');
  });

  it('evaluates the raw boolean function true()', () => {
    expect(run(XML, 'true()')).toBe('true');
  });

  it('serializes selected element nodes to their XML markup', () => {
    expect(run(XML, '/books')).toBe(XML);
  });

  it('joins multiple element-node matches with newlines', () => {
    expect(run(XML, '//title')).toBe('<title>A</title>\n<title>B</title>');
  });

  it('reads attribute values via the node value', () => {
    expect(run('<r><n id="5"/></r>', '//n/@id')).toBe('5');
  });

  it('applies positional predicates per parent context', () => {
    // Each book has exactly one title, so [1] still matches both titles
    // while [2] matches none.
    expect(run(XML, '//title[1]/text()')).toBe('A\nB');
    expect(run(XML, '//title[2]/text()')).toBe('No matches.');
  });

  it('returns the value of comment nodes', () => {
    expect(run('<r><!--hello--><t>x</t></r>', '//comment()')).toBe('hello');
  });

  it('handles unicode and emoji content', () => {
    expect(run('<r><t>héllo🚀</t></r>', '//t/text()')).toBe('héllo🚀');
  });

  it('supports normalize-space() returning a string', () => {
    expect(run('<r><t>  spaced   out  </t></r>', 'normalize-space(//t)')).toBe('spaced out');
  });

  it('handles large input deterministically', () => {
    const items = Array.from({ length: 500 }, (_, i) => `<i>${i}</i>`).join('');
    const xml = `<root>${items}</root>`;
    expect(run(xml, 'count(//i)')).toBe('500');
    expect(run(xml, '//i[1]/text()')).toBe('0');
  });

  it('throws on an invalid XPath expression', () => {
    expect(() => run(XML, '//[')).toThrow();
  });

  it('throws on empty XML input (no root element)', () => {
    expect(() => run('', '//title')).toThrow();
  });

  it('throws on malformed XML with unclosed tags', () => {
    expect(() => run('<r><unclosed>', '//r')).toThrow();
  });
});

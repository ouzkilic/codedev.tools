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
});

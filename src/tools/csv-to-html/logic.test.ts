import { describe, it, expect } from 'vitest';
import { csvToHtmlLogic } from './logic';

describe('csvToHtmlLogic', () => {
  it('builds header th cells', () => {
    const out = csvToHtmlLogic.transform('a,b\n1,2');
    expect(out).toContain('<th>a</th>');
    expect(out).toContain('<th>b</th>');
  });

  it('builds body td cells', () => {
    const out = csvToHtmlLogic.transform('a,b\n1,2');
    expect(out).toContain('<td>1</td>');
    expect(out).toContain('<td>2</td>');
  });

  it('escapes special characters in cells', () => {
    const out = csvToHtmlLogic.transform('h\n"<b>"');
    expect(out).toContain('&lt;b&gt;');
    expect(out).not.toContain('<b>');
  });

  it('wraps output in a table element', () => {
    const out = csvToHtmlLogic.transform('a\n1');
    expect(out.startsWith('<table>')).toBe(true);
    expect(out.trim().endsWith('</table>')).toBe(true);
  });

  it('throws on empty input', () => {
    expect(() => csvToHtmlLogic.transform('')).toThrow();
  });
});

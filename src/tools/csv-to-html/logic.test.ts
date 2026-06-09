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

  it('produces exact full structure for a single header + single body row', () => {
    const out = csvToHtmlLogic.transform('a\n1');
    expect(out).toBe(
      '<table>\n  <thead>\n    <tr><th>a</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>1</td></tr>\n  </tbody>\n</table>',
    );
  });

  it('produces an empty tbody when only a header row exists', () => {
    const out = csvToHtmlLogic.transform('a,b');
    expect(out).toBe(
      '<table>\n  <thead>\n    <tr><th>a</th><th>b</th></tr>\n  </thead>\n  <tbody></tbody>\n</table>',
    );
  });

  it('contains thead and tbody sections', () => {
    const out = csvToHtmlLogic.transform('a,b\n1,2');
    expect(out).toContain('<thead>');
    expect(out).toContain('</thead>');
    expect(out).toContain('<tbody>');
    expect(out).toContain('</tbody>');
  });

  it('renders multiple body rows joined by newline + indentation', () => {
    const out = csvToHtmlLogic.transform('a,b\n1,2\n3,4');
    expect(out).toContain('<tr><td>1</td><td>2</td></tr>');
    expect(out).toContain('<tr><td>3</td><td>4</td></tr>');
    expect(out).toContain('</tr>\n    <tr>');
  });

  it('trims leading and trailing whitespace before parsing', () => {
    const out = csvToHtmlLogic.transform('  \n a,b\n1,2 \n  ');
    expect(out).toContain('<th>a</th>');
    expect(out).toContain('<th>b</th>');
    // trailing whitespace inside a trimmed line is preserved by papaparse
    expect(out).toContain('<td>1</td>');
  });

  it('skips empty lines between data rows', () => {
    const out = csvToHtmlLogic.transform('a,b\n1,2\n\n3,4');
    expect(out).toContain('<td>1</td>');
    expect(out).toContain('<td>3</td>');
    // only two body rows -> exactly one inter-row separator
    const sepCount = out.split('</tr>\n    <tr>').length - 1;
    expect(sepCount).toBe(1);
  });

  it('escapes ampersands', () => {
    const out = csvToHtmlLogic.transform('h\nA&B');
    expect(out).toContain('<td>A&amp;B</td>');
    expect(out).not.toContain('A&B</td>');
  });

  it('escapes ampersand before angle brackets (no double-escaping)', () => {
    const out = csvToHtmlLogic.transform('h\n"<a & b>"');
    expect(out).toContain('<td>&lt;a &amp; b&gt;</td>');
    // ensure & in &lt; / &gt; is not itself re-escaped to &amp;lt;
    expect(out).not.toContain('&amp;lt;');
    expect(out).not.toContain('&amp;gt;');
  });

  it('does not escape double quotes (only & < >)', () => {
    // a quoted field with an embedded quote -> papaparse yields a single "
    const out = csvToHtmlLogic.transform('h\n"a""b"');
    expect(out).toContain('<td>a"b</td>');
  });

  it('escapes special characters in header cells too', () => {
    const out = csvToHtmlLogic.transform('"<x>"\n1');
    expect(out).toContain('<th>&lt;x&gt;</th>');
    expect(out).not.toContain('<th><x></th>');
  });

  it('handles unicode and emoji content', () => {
    const out = csvToHtmlLogic.transform('name,emoji\nçöğü,😀🚀');
    expect(out).toContain('<th>name</th>');
    expect(out).toContain('<td>çöğü</td>');
    expect(out).toContain('<td>😀🚀</td>');
  });

  it('preserves commas inside quoted fields', () => {
    const out = csvToHtmlLogic.transform('h\n"a,b,c"');
    expect(out).toContain('<td>a,b,c</td>');
    // a single cell, not three
    expect(out).not.toContain('<td>a</td><td>b</td>');
  });

  it('preserves embedded newlines inside quoted fields', () => {
    const out = csvToHtmlLogic.transform('h\n"line1\nline2"');
    expect(out).toContain('<td>line1\nline2</td>');
  });

  it('keeps empty cells as empty td', () => {
    const out = csvToHtmlLogic.transform('a,b,c\n1,,3');
    expect(out).toContain('<tr><td>1</td><td></td><td>3</td></tr>');
  });

  it('handles a trailing separator producing an extra empty header cell', () => {
    const out = csvToHtmlLogic.transform('a,b,\n1,2,3');
    expect(out).toContain('<tr><th>a</th><th>b</th><th></th></tr>');
  });

  it('handles numeric-looking and boundary values as plain strings', () => {
    const out = csvToHtmlLogic.transform('n\n0\n-1\n9999999999');
    expect(out).toContain('<td>0</td>');
    expect(out).toContain('<td>-1</td>');
    expect(out).toContain('<td>9999999999</td>');
  });

  it('handles a large number of rows', () => {
    const lines = ['h'];
    for (let i = 0; i < 1000; i++) lines.push(String(i));
    const out = csvToHtmlLogic.transform(lines.join('\n'));
    expect(out).toContain('<td>0</td>');
    expect(out).toContain('<td>999</td>');
    const rowCount = out.split('<tr><td>').length - 1;
    expect(rowCount).toBe(1000);
  });

  it('is deterministic for identical input', () => {
    const input = 'a,b\n1,2\n3,4';
    expect(csvToHtmlLogic.transform(input)).toBe(csvToHtmlLogic.transform(input));
  });

  it('throws "No data to convert" on whitespace-only input', () => {
    expect(() => csvToHtmlLogic.transform('   \n  \t ')).toThrow('No data to convert');
  });

  it('throws on a malformed quoted field (unterminated quote with stray quote)', () => {
    // mismatched quotes that papaparse reports as a non-Delimiter error
    expect(() => csvToHtmlLogic.transform('a,b\n"un"terminated,x')).toThrow();
  });
});

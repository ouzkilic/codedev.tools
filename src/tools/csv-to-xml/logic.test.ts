import { describe, it, expect } from 'vitest';
import { csvToXmlLogic } from './logic';

const t = (input: string) => csvToXmlLogic.transform(input);

describe('csvToXmlLogic', () => {
  it('converts a simple CSV with header', () => {
    const out = t('name,age\nAda,36');
    expect(out).toContain('<rows>');
    expect(out).toContain('<name>Ada</name>');
    expect(out).toContain('<age>36</age>');
    expect(out).toContain('</rows>');
  });

  it('escapes special XML characters', () => {
    const out = t('label\nA & B < C > D');
    expect(out).toContain('<label>A &amp; B &lt; C &gt; D</label>');
  });

  it('sanitizes header names into valid tags', () => {
    const out = t('first name,e-mail\nAda,a@b.com');
    expect(out).toContain('<first_name>Ada</first_name>');
    expect(out).toContain('<e_mail>a@b.com</e_mail>');
  });

  it('handles multiple rows', () => {
    const out = t('x\n1\n2');
    expect(out).toContain('<x>1</x>');
    expect(out).toContain('<x>2</x>');
    expect(out.match(/<row>/g)?.length).toBe(2);
  });

  it('produces empty rows wrapper for empty input', () => {
    const out = t('');
    expect(out).toBe('<rows>\n</rows>');
  });

  it('produces the exact full structure for a one-row CSV', () => {
    const out = t('a,b\n1,2');
    expect(out).toBe(
      '<rows>\n  <row>\n    <a>1</a>\n    <b>2</b>\n  </row>\n</rows>',
    );
  });

  it('starts with the rows opening and ends with the rows closing', () => {
    const out = t('k\nv');
    expect(out.startsWith('<rows>\n')).toBe(true);
    expect(out.endsWith('</rows>')).toBe(true);
  });

  it('emits one <row> wrapper per data record', () => {
    const out = t('a\n1\n2\n3\n4');
    expect(out.match(/<row>/g)?.length).toBe(4);
    expect(out.match(/<\/row>/g)?.length).toBe(4);
  });

  it('trims surrounding whitespace of the whole input before parsing', () => {
    const out = t('   \n a,b\n1,2 \n  ');
    // outer whitespace (incl. the trailing space after the final cell) is trimmed
    expect(out).toBe('<rows>\n  <row>\n    <a>1</a>\n    <b>2</b>\n  </row>\n</rows>');
  });

  it('treats a header-only CSV as zero rows', () => {
    const out = t('a,b,c');
    expect(out).toBe('<rows>\n</rows>');
    expect(out).not.toContain('<row>');
  });

  it('whitespace-only input yields an empty rows wrapper (no throw)', () => {
    expect(t('   ')).toBe('<rows>\n</rows>');
    expect(t('\n\n\t  \n')).toBe('<rows>\n</rows>');
  });

  it('skips blank lines between records', () => {
    const out = t('a,b\n1,2\n\n3,4');
    expect(out.match(/<row>/g)?.length).toBe(2);
    expect(out).toContain('<a>3</a>');
  });

  it('auto-detects semicolon delimiter', () => {
    const out = t('a;b\n1;2');
    expect(out).toContain('<a>1</a>');
    expect(out).toContain('<b>2</b>');
  });

  it('auto-detects tab delimiter', () => {
    const out = t('a\tb\n1\t2');
    expect(out).toContain('<a>1</a>');
    expect(out).toContain('<b>2</b>');
  });

  it('keeps commas that are inside quoted fields', () => {
    const out = t('a,b\n"x,y",z');
    expect(out).toContain('<a>x,y</a>');
    expect(out).toContain('<b>z</b>');
  });

  it('keeps newlines that are inside quoted fields', () => {
    const out = t('a,b\n"line1\nline2",z');
    expect(out).toContain('<a>line1\nline2</a>');
    expect(out).toContain('<b>z</b>');
  });

  it('unescapes doubled quotes inside a field (quotes are not XML-escaped)', () => {
    const out = t('a\n"He said ""hi"""');
    expect(out).toContain('<a>He said "hi"</a>');
  });

  it('renames duplicate headers rather than throwing', () => {
    const out = t('a,a\n1,2');
    expect(out).toContain('<a>1</a>');
    expect(out).toContain('<a_1>2</a_1>');
  });

  it('preserves unicode and emoji content', () => {
    const out = t('name,note\nrésumé,smile 😀 漢字');
    expect(out).toContain('<name>résumé</name>');
    expect(out).toContain('<note>smile 😀 漢字</note>');
  });

  it('handles numeric boundary values as plain strings', () => {
    const out = t('n\n0\n-5\n3.14');
    expect(out).toContain('<n>0</n>');
    expect(out).toContain('<n>-5</n>');
    expect(out).toContain('<n>3.14</n>');
  });

  it('sanitizes header consisting only of symbols into underscores', () => {
    const out = t('@#$\nx');
    expect(out).toContain('<___>x</___>');
  });

  it('does not escape ampersand more than once (single pass)', () => {
    const out = t('h\n&amp;');
    // raw text "&amp;" -> only the leading & is escaped
    expect(out).toContain('<h>&amp;amp;</h>');
  });

  it('handles a large input without crashing and keeps row count', () => {
    const rows = Array.from({ length: 500 }, (_, i) => `${i},val${i}`).join('\n');
    const out = t(`id,name\n${rows}`);
    expect(out.match(/<row>/g)?.length).toBe(500);
    expect(out).toContain('<id>0</id>');
    expect(out).toContain('<id>499</id>');
    expect(out).toContain('<name>val499</name>');
  });

  it('is deterministic for the same input', () => {
    const input = 'a,b\n1,2\n3,4';
    expect(t(input)).toBe(t(input));
  });

  it('throws on too many fields (FieldMismatch) with a row number', () => {
    expect(() => t('a,b\n1,2,3')).toThrow(/Too many fields/);
    expect(() => t('a,b\n1,2,3')).toThrow(/row 1/);
  });

  it('throws on too few fields (FieldMismatch)', () => {
    expect(() => t('a,b,c\n1,2')).toThrow(/Too few fields/);
  });

  it('throws on an unterminated quoted field', () => {
    expect(() => t('a,b\n"oops,2')).toThrow(/Quoted field unterminated/);
  });
});

import { describe, it, expect } from 'vitest';
import { csvToXmlLogic } from './logic';

describe('csvToXmlLogic', () => {
  it('converts a simple CSV with header', () => {
    const out = csvToXmlLogic.transform('name,age\nAda,36');
    expect(out).toContain('<rows>');
    expect(out).toContain('<name>Ada</name>');
    expect(out).toContain('<age>36</age>');
    expect(out).toContain('</rows>');
  });

  it('escapes special XML characters', () => {
    const out = csvToXmlLogic.transform('label\nA & B < C > D');
    expect(out).toContain('<label>A &amp; B &lt; C &gt; D</label>');
  });

  it('sanitizes header names into valid tags', () => {
    const out = csvToXmlLogic.transform('first name,e-mail\nAda,a@b.com');
    expect(out).toContain('<first_name>Ada</first_name>');
    expect(out).toContain('<e_mail>a@b.com</e_mail>');
  });

  it('handles multiple rows', () => {
    const out = csvToXmlLogic.transform('x\n1\n2');
    expect(out).toContain('<x>1</x>');
    expect(out).toContain('<x>2</x>');
    expect(out.match(/<row>/g)?.length).toBe(2);
  });

  it('produces empty rows wrapper for empty input', () => {
    const out = csvToXmlLogic.transform('');
    expect(out).toBe('<rows>\n</rows>');
  });
});

import { describe, it, expect } from 'vitest';
import { htmlStripLogic } from './logic';

describe('htmlStripLogic', () => {
  it('strips nested tags', () => {
    expect(htmlStripLogic.transform('<p>Hi <b>there</b></p>')).toBe('Hi there');
  });

  it('strips tags with attributes', () => {
    expect(htmlStripLogic.transform('<a href="x">link</a>')).toBe('link');
  });

  it('decodes &amp;', () => {
    expect(htmlStripLogic.transform('a &amp; b')).toBe('a & b');
  });

  it('decodes &lt; and &gt;', () => {
    expect(htmlStripLogic.transform('&lt;tag&gt;')).toBe('<tag>');
  });

  it('decodes nbsp to space and quotes', () => {
    expect(htmlStripLogic.transform('foo&nbsp;&quot;bar&quot;&#39;')).toBe('foo "bar"\'');
  });

  it('collapses excessive blank lines and trims', () => {
    expect(htmlStripLogic.transform('  <div>x</div>\n\n\n\n<div>y</div>  ')).toBe('x\n\ny');
  });
});

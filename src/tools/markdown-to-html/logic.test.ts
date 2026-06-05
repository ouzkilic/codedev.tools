import { describe, it, expect } from 'vitest';
import { markdownToHtmlLogic } from './logic';

describe('markdownToHtml', () => {
  it('converts headings', () => {
    expect(markdownToHtmlLogic.transform('# Hi')).toContain('<h1>Hi</h1>');
  });
  it('converts bold and emphasis', () => {
    const out = markdownToHtmlLogic.transform('**bold** and *italic*');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<em>italic</em>');
  });
  it('converts links', () => {
    expect(markdownToHtmlLogic.transform('[x](https://e.com)')).toContain('href="https://e.com"');
  });
});

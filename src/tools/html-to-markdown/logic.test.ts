import { describe, it, expect } from 'vitest';
import { htmlToMarkdownLogic } from './logic';

describe('htmlToMarkdown', () => {
  it('converts headings with atx style', () => {
    expect(htmlToMarkdownLogic.transform('<h1>Hi</h1>')).toContain('# Hi');
  });
  it('converts bold text', () => {
    expect(htmlToMarkdownLogic.transform('<p><strong>bold</strong></p>')).toContain('**bold**');
  });
  it('converts links', () => {
    expect(htmlToMarkdownLogic.transform('<a href="https://e.com">x</a>')).toContain('[x](https://e.com)');
  });
});

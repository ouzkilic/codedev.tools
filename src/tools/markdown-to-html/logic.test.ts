import { describe, it, expect } from 'vitest';
import { markdownToHtmlLogic } from './logic';

const md = (input: string): string => markdownToHtmlLogic.transform(input);

describe('markdownToHtml', () => {
  // --- existing assertions (kept) ---
  it('converts headings', () => {
    expect(md('# Hi')).toContain('<h1>Hi</h1>');
  });

  it('converts bold and emphasis', () => {
    const out = md('**bold** and *italic*');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<em>italic</em>');
  });

  it('converts links', () => {
    expect(md('[x](https://e.com)')).toContain('href="https://e.com"');
  });

  // --- heading levels ---
  it('converts every heading level h1..h6', () => {
    expect(md('# A')).toContain('<h1>A</h1>');
    expect(md('## A')).toContain('<h2>A</h2>');
    expect(md('### A')).toContain('<h3>A</h3>');
    expect(md('#### A')).toContain('<h4>A</h4>');
    expect(md('##### A')).toContain('<h5>A</h5>');
    expect(md('###### A')).toContain('<h6>A</h6>');
  });

  it('does not treat 7 hashes as a heading (no h7)', () => {
    const out = md('####### Seven');
    expect(out).not.toContain('<h7>');
    expect(out).toContain('<p>####### Seven</p>');
  });

  // --- empty / whitespace edge cases ---
  it('returns empty string for empty input', () => {
    expect(md('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(md('   \n  \t ')).toBe('');
  });

  // --- inline + block code ---
  it('converts inline code', () => {
    expect(md('use `code` here')).toBe('<p>use <code>code</code> here</p>\n');
  });

  it('converts fenced code blocks with language class', () => {
    const out = md('```js\nconst x=1;\n```');
    expect(out).toContain('<pre><code class="language-js">');
    expect(out).toContain('const x=1;');
  });

  // --- lists ---
  it('converts unordered lists', () => {
    expect(md('- a\n- b')).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n');
  });

  it('converts ordered lists', () => {
    expect(md('1. a\n2. b')).toBe('<ol>\n<li>a</li>\n<li>b</li>\n</ol>\n');
  });

  it('converts nested lists', () => {
    const out = md('- a\n  - b');
    expect(out).toContain('<ul>');
    expect(out).toContain('<li>a<ul>');
    expect(out).toContain('<li>b</li>');
  });

  // --- blockquote, hr, paragraph ---
  it('converts blockquotes', () => {
    expect(md('> quote')).toBe('<blockquote>\n<p>quote</p>\n</blockquote>\n');
  });

  it('converts horizontal rules', () => {
    expect(md('---')).toBe('<hr>\n');
  });

  it('handles a leading separator followed by text', () => {
    expect(md('---\ntext')).toBe('<hr>\n<p>text</p>\n');
  });

  it('wraps plain text in a paragraph', () => {
    expect(md('hello world')).toBe('<p>hello world</p>\n');
  });

  // --- tables (GFM) ---
  it('converts GFM tables', () => {
    const out = md('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(out).toContain('<table>');
    expect(out).toContain('<th>a</th>');
    expect(out).toContain('<td>1</td>');
  });

  // --- strikethrough + autolink ---
  it('converts strikethrough', () => {
    expect(md('~~gone~~')).toBe('<p><del>gone</del></p>\n');
  });

  it('converts angle-bracket autolinks', () => {
    expect(md('<https://example.com>')).toContain('<a href="https://example.com">https://example.com</a>');
  });

  // --- images ---
  it('converts images with alt text', () => {
    const out = md('![alt](img.png)');
    expect(out).toContain('<img src="img.png"');
    expect(out).toContain('alt="alt"');
  });

  // --- entity escaping in text ---
  it('escapes ampersands and angle brackets in text content', () => {
    expect(md('a & b < c > d "q"')).toBe('<p>a &amp; b &lt; c &gt; d &quot;q&quot;</p>\n');
  });

  // --- unicode / emoji ---
  it('preserves unicode and emoji characters', () => {
    const out = md('café 🎉 日本語');
    expect(out).toContain('café');
    expect(out).toContain('🎉');
    expect(out).toContain('日本語');
  });

  // --- raw HTML passthrough (output is shown as text, not rendered) ---
  it('passes raw block-level HTML through unchanged', () => {
    expect(md('<div>raw</div>')).toBe('<div>raw</div>');
  });

  // --- output type ---
  it('always returns a string', () => {
    expect(typeof md('# x')).toBe('string');
    expect(typeof md('')).toBe('string');
  });

  // --- determinism ---
  it('is deterministic for the same input', () => {
    const input = '# Title\n\nsome **bold** text and `code`';
    expect(md(input)).toBe(md(input));
  });

  // --- large input ---
  it('handles very large input without truncating the leading heading', () => {
    const big = '# Heading\n\n' + 'word '.repeat(5000);
    const out = md(big);
    expect(out.startsWith('<h1>Heading</h1>')).toBe(true);
    expect(out.length).toBeGreaterThan(20000);
  });

  // --- combined document structure ---
  it('converts a combined document with multiple block types', () => {
    const out = md('# Title\n\nPara with **bold**.\n\n- item\n\n> quote');
    expect(out).toContain('<h1>Title</h1>');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<li>item</li>');
    expect(out).toContain('<blockquote>');
  });
});

import { describe, it, expect } from 'vitest';
import { htmlToMarkdownLogic } from './logic';

const md = (html: string) => htmlToMarkdownLogic.transform(html);

describe('htmlToMarkdown', () => {
  // --- existing assertions (kept) ---
  it('converts headings with atx style', () => {
    expect(md('<h1>Hi</h1>')).toContain('# Hi');
  });
  it('converts bold text', () => {
    expect(md('<p><strong>bold</strong></p>')).toContain('**bold**');
  });
  it('converts links', () => {
    expect(md('<a href="https://e.com">x</a>')).toContain('[x](https://e.com)');
  });

  // --- headings: atx style across all levels ---
  it('uses atx (#) for h1 with no trailing/leading whitespace', () => {
    expect(md('<h1>Hi</h1>')).toBe('# Hi');
  });
  it('uses ## for h2', () => {
    expect(md('<h2>Sub</h2>')).toBe('## Sub');
  });
  it('uses ###### for h6 (deepest level)', () => {
    expect(md('<h6>Deep</h6>')).toBe('###### Deep');
  });

  // --- inline emphasis ---
  it('converts em to underscore emphasis', () => {
    expect(md('<p><em>it</em></p>')).toBe('_it_');
  });
  it('converts bold to exactly **bold** with no surrounding markup', () => {
    expect(md('<p><strong>bold</strong></p>')).toBe('**bold**');
  });

  // --- lists ---
  it('converts unordered lists with * bullets', () => {
    expect(md('<ul><li>a</li><li>b</li></ul>')).toBe('*   a\n*   b');
  });
  it('converts ordered lists with numbered prefixes', () => {
    expect(md('<ol><li>a</li><li>b</li></ol>')).toBe('1.  a\n2.  b');
  });
  it('indents nested unordered lists', () => {
    expect(md('<ul><li>a<ul><li>b</li></ul></li></ul>')).toBe('*   a\n    *   b');
  });

  // --- code ---
  it('converts inline code with backticks', () => {
    expect(md('<p>use <code>x()</code></p>')).toBe('use `x()`');
  });
  it('converts pre/code blocks with fenced style (```)', () => {
    const out = md('<pre><code>const a=1;\nconst b=2;</code></pre>');
    expect(out).toBe('```\nconst a=1;\nconst b=2;\n```');
    expect(out.startsWith('```')).toBe(true);
    expect(out.endsWith('```')).toBe(true);
  });

  // --- block elements ---
  it('converts blockquote with > prefix', () => {
    expect(md('<blockquote>quote</blockquote>')).toBe('> quote');
  });
  it('converts hr to a thematic break', () => {
    expect(md('<hr>')).toBe('* * *');
  });
  it('separates multiple paragraphs with a blank line', () => {
    expect(md('<p>one</p><p>two</p>')).toBe('one\n\ntwo');
  });
  it('converts <br> to a hard line break (two trailing spaces)', () => {
    expect(md('a<br>b')).toBe('a  \nb');
  });

  // --- images ---
  it('converts images to markdown image syntax with alt text', () => {
    expect(md('<img src="a.png" alt="alt">')).toBe('![alt](a.png)');
  });

  // --- edge: empty / whitespace ---
  it('returns empty string for empty input', () => {
    expect(md('')).toBe('');
  });
  it('collapses whitespace-only input to empty string', () => {
    expect(md('   ')).toBe('');
  });
  it('passes through plain text unchanged', () => {
    expect(md('just text')).toBe('just text');
  });

  // --- unicode / emoji ---
  it('preserves unicode and emoji characters', () => {
    expect(md('<p>héllo 世界 😀</p>')).toBe('héllo 世界 😀');
  });

  // --- special chars / escaping ---
  it('escapes markdown-significant leading characters and decodes entities', () => {
    // &amp;/&lt;/&gt; decode to & < > ; leading * is escaped to avoid a list
    expect(md('<p>* not a list &amp; &lt; &gt;</p>')).toBe('\\* not a list & < >');
  });

  // --- script tag: tag removed, text content retained (turndown default) ---
  it('strips script tags but keeps surrounding/inner text', () => {
    expect(md('<script>alert(1)</script>hi')).toBe('alert(1)hi');
  });

  // --- strikethrough not enabled by default ---
  it('passes <del> content through as plain text (no GFM strikethrough)', () => {
    expect(md('<del>gone</del>')).toBe('gone');
  });

  // --- tables (no GFM table plugin → cell text on separate lines) ---
  it('does not produce a pipe table without the GFM plugin', () => {
    const out = md('<table><tr><td>a</td><td>b</td></tr></table>');
    expect(out).not.toContain('|');
    expect(out).toContain('a');
    expect(out).toContain('b');
  });

  // --- malformed / unclosed html does not throw ---
  it('handles unclosed tags gracefully without throwing', () => {
    expect(() => md('<div><p>unclosed')).not.toThrow();
    expect(md('<div><p>unclosed')).toBe('unclosed');
  });

  // --- large input: linear & non-crashing ---
  it('handles large input without throwing and converts every item', () => {
    const items = Array.from({ length: 500 }, (_, i) => `<li>item${i}</li>`).join('');
    const out = md(`<ul>${items}</ul>`);
    expect(out).toContain('item0');
    expect(out).toContain('item499');
    expect(out.split('\n').length).toBe(500);
  });

  // --- determinism / idempotency on the output side ---
  it('is deterministic: same input yields identical output', () => {
    const html = '<h1>T</h1><p><strong>x</strong> and <em>y</em></p>';
    expect(md(html)).toBe(md(html));
  });
  it('is idempotent on already-clean markdown-equivalent plain text', () => {
    const once = md('<p>stable text</p>');
    expect(md(`<p>${once}</p>`)).toBe(once);
  });
});

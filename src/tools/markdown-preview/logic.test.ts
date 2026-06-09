import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './logic';

describe('markdownPreview > renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# Hi')).toContain('<h1>Hi</h1>');
  });

  it('renders all heading levels', () => {
    expect(renderMarkdown('## H2')).toContain('<h2>H2</h2>');
    expect(renderMarkdown('### H3')).toContain('<h3>H3</h3>');
    expect(renderMarkdown('###### H6')).toContain('<h6>H6</h6>');
  });

  it('renders unordered lists', () => {
    const out = renderMarkdown('- a\n- b');
    expect(out).toContain('<li>a</li>');
    expect(out).toContain('<li>b</li>');
    expect(out).toContain('<ul>');
  });

  it('renders ordered lists', () => {
    const out = renderMarkdown('1. a\n2. b');
    expect(out).toContain('<ol>');
    expect(out).toContain('<li>a</li>');
    expect(out).toContain('<li>b</li>');
  });

  it('renders task lists with checkboxes', () => {
    const out = renderMarkdown('- [ ] todo\n- [x] done');
    expect(out).toContain('type="checkbox"');
    expect(out).toContain('disabled');
    expect(out).toContain('checked');
  });

  it('renders inline code', () => {
    expect(renderMarkdown('`x`')).toContain('<code>x</code>');
  });

  it('renders fenced code blocks with language class', () => {
    const out = renderMarkdown('```js\ncode\n```');
    expect(out).toContain('<pre>');
    expect(out).toContain('class="language-js"');
    expect(out).toContain('code');
  });

  it('renders bold and italic emphasis', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
    expect(renderMarkdown('*italic*')).toContain('<em>italic</em>');
  });

  it('renders links', () => {
    const out = renderMarkdown('[x](http://a.com)');
    expect(out).toContain('<a href="http://a.com">x</a>');
  });

  it('renders images', () => {
    const out = renderMarkdown('![alt](img.png)');
    expect(out).toContain('<img');
    expect(out).toContain('src="img.png"');
    expect(out).toContain('alt="alt"');
  });

  it('renders blockquotes', () => {
    const out = renderMarkdown('> quote');
    expect(out).toContain('<blockquote>');
    expect(out).toContain('<p>quote</p>');
  });

  it('renders horizontal rules', () => {
    expect(renderMarkdown('---')).toContain('<hr>');
  });

  it('renders GFM tables', () => {
    const out = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |');
    expect(out).toContain('<table>');
    expect(out).toContain('<th>a</th>');
    expect(out).toContain('<td>1</td>');
  });

  it('wraps plain text in a paragraph', () => {
    expect(renderMarkdown('plain text')).toBe('<p>plain text</p>\n');
  });

  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(renderMarkdown('   ')).toBe('');
  });

  it('escapes HTML special characters in text', () => {
    const out = renderMarkdown('a & b < c > d');
    expect(out).toContain('&amp;');
    expect(out).toContain('&lt;');
    expect(out).toContain('&gt;');
  });

  it('preserves unicode and emoji', () => {
    const out = renderMarkdown('emoji 😀 héllo');
    expect(out).toContain('😀');
    expect(out).toContain('héllo');
  });

  it('handles a soft line break inside a paragraph', () => {
    expect(renderMarkdown('line1\nline2')).toBe('<p>line1\nline2</p>\n');
  });

  it('handles inline code containing backticks', () => {
    expect(renderMarkdown('text with ` `` ` inline')).toContain('<code>``</code>');
  });

  it('renders multiple sibling headings', () => {
    expect(renderMarkdown('# A\n\n# B')).toBe('<h1>A</h1>\n<h1>B</h1>\n');
  });

  it('returns a string type for any input', () => {
    expect(typeof renderMarkdown('# anything')).toBe('string');
  });

  it('handles very large input without crashing', () => {
    const big = '# H\n'.repeat(2000);
    const out = renderMarkdown(big);
    expect(out.startsWith('<h1>H</h1>')).toBe(true);
    expect(out.length).toBeGreaterThan(10000);
  });

  it('is deterministic for identical input', () => {
    expect(renderMarkdown('# Hi')).toBe(renderMarkdown('# Hi'));
  });

  it('is idempotent-stable across repeated complex documents', () => {
    const doc = '# Title\n\n- one\n- two\n\n> quote\n\n```ts\nconst x = 1;\n```\n';
    expect(renderMarkdown(doc)).toBe(renderMarkdown(doc));
  });
});

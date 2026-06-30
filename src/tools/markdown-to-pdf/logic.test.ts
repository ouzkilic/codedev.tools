import { describe, it, expect } from 'vitest';
import {
  buildDocument,
  deriveTitle,
  MARGINS,
  PAGE_SIZES,
  renderMarkdownToHtml,
} from './logic';

describe('renderMarkdownToHtml', () => {
  it('converts headings, emphasis and links', () => {
    expect(renderMarkdownToHtml('# Hi')).toContain('<h1>Hi</h1>');
    expect(renderMarkdownToHtml('**b**')).toContain('<strong>b</strong>');
    expect(renderMarkdownToHtml('[x](https://e.com)')).toContain('href="https://e.com"');
  });

  it('converts GFM tables', () => {
    const out = renderMarkdownToHtml('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(out).toContain('<table>');
    expect(out).toContain('<th>a</th>');
    expect(out).toContain('<td>1</td>');
  });

  it('converts fenced code blocks with a language class', () => {
    const out = renderMarkdownToHtml('```ts\nconst x=1;\n```');
    expect(out).toContain('<pre><code class="language-ts">');
  });

  it('returns a string for empty input', () => {
    expect(typeof renderMarkdownToHtml('')).toBe('string');
  });

  it('is deterministic for the same input', () => {
    const md = '# Title\n\nsome **bold** text and `code`';
    expect(renderMarkdownToHtml(md)).toBe(renderMarkdownToHtml(md));
  });
});

describe('deriveTitle', () => {
  it('uses the first ATX heading', () => {
    expect(deriveTitle('# My Report\n\nbody')).toBe('My Report');
  });

  it('prefers the first heading even when text precedes it', () => {
    expect(deriveTitle('intro line\n\n## Section One\n')).toBe('Section One');
  });

  it('strips trailing closing hashes from a heading', () => {
    expect(deriveTitle('## Heading ##')).toBe('Heading');
  });

  it('falls back to the first non-empty line when there is no heading', () => {
    expect(deriveTitle('\n\njust a paragraph\nmore')).toBe('just a paragraph');
  });

  it('truncates very long fallback lines to 120 chars', () => {
    expect(deriveTitle('x'.repeat(300))).toHaveLength(120);
  });

  it('uses the fallback for empty/whitespace input', () => {
    expect(deriveTitle('   \n\t')).toBe('document');
    expect(deriveTitle('', 'untitled')).toBe('untitled');
  });
});

describe('buildDocument', () => {
  const body = '<h1>Hello</h1><p>World</p>';

  it('produces a complete, self-contained HTML document', () => {
    const doc = buildDocument(body, { pageSize: 'a4', margin: 'normal' });
    expect(doc.startsWith('<!doctype html>')).toBe(true);
    expect(doc).toContain('<style>');
    expect(doc).toContain(body);
  });

  it('maps the page-size option to the right @page size', () => {
    expect(buildDocument(body, { pageSize: 'a4', margin: 'normal' })).toContain(`size: ${PAGE_SIZES.a4}`);
    expect(buildDocument(body, { pageSize: 'letter', margin: 'normal' })).toContain(`size: ${PAGE_SIZES.letter}`);
    expect(buildDocument(body, { pageSize: 'legal', margin: 'normal' })).toContain(`size: ${PAGE_SIZES.legal}`);
  });

  it('zeroes the @page margin so the browser omits its own headers and footers', () => {
    expect(buildDocument(body, { pageSize: 'a4', margin: 'normal' })).toContain('@page { size: A4; margin: 0; }');
  });

  it('wraps content in a thead/tfoot table so margins repeat on every page', () => {
    const doc = buildDocument(body, { pageSize: 'a4', margin: 'normal' });
    expect(doc).toContain('<table class="page"');
    expect(doc).toContain('<thead>');
    expect(doc).toContain('<tfoot>');
    expect(doc).toContain('<td class="content">');
  });

  it('reserves the chosen margin on every side (spacer height + content padding)', () => {
    const narrow = buildDocument(body, { pageSize: 'a4', margin: 'narrow' });
    expect(narrow).toContain(`.spacer { height: ${MARGINS.narrow}; }`);
    expect(narrow).toContain(`padding: 0 ${MARGINS.narrow}`);
    const wide = buildDocument(body, { pageSize: 'a4', margin: 'wide' });
    expect(wide).toContain(`.spacer { height: ${MARGINS.wide}; }`);
    expect(wide).toContain(`padding: 0 ${MARGINS.wide}`);
  });

  it('sets the document title and uses a default when none is given', () => {
    expect(buildDocument(body, { pageSize: 'a4', margin: 'normal', title: 'My Doc' })).toContain('<title>My Doc</title>');
    expect(buildDocument(body, { pageSize: 'a4', margin: 'normal' })).toContain('<title>document</title>');
  });

  it('escapes HTML-special characters in the title', () => {
    const doc = buildDocument(body, { pageSize: 'a4', margin: 'normal', title: '<script>"&"</script>' });
    expect(doc).toContain('<title>&lt;script&gt;&quot;&amp;&quot;&lt;/script&gt;</title>');
    expect(doc).not.toContain('<title><script>');
  });

  it('includes print rules for paged output', () => {
    const doc = buildDocument(body, { pageSize: 'a4', margin: 'normal' });
    expect(doc).toContain('@page');
    expect(doc).toContain('@media print');
    expect(doc).toContain('break-inside: avoid');
  });
});

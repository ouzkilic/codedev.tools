import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './logic';

describe('markdownPreview', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# Hi')).toContain('<h1>Hi</h1>');
  });
  it('renders lists', () => {
    const out = renderMarkdown('- a\n- b');
    expect(out).toContain('<li>a</li>');
    expect(out).toContain('<ul>');
  });
  it('renders inline code', () => {
    expect(renderMarkdown('`x`')).toContain('<code>x</code>');
  });
});

import { describe, expect, it } from 'vitest';
import { buildMetaTags } from './logic';

describe('buildMetaTags', () => {
  it('builds title and og:title', () => {
    const out = buildMetaTags({ title: 'Hi', description: 'D', type: 'website' });
    expect(out).toContain('<title>Hi</title>');
    expect(out).toContain('og:title" content="Hi"');
  });

  it('escapes a title containing &', () => {
    const out = buildMetaTags({ title: 'A & B', description: '', type: 'website' });
    expect(out).toContain('<title>A &amp; B</title>');
  });

  it('omits og:url when url empty', () => {
    const out = buildMetaTags({ title: 'Hi', description: 'D', type: 'website' });
    expect(out).not.toContain('og:url');
  });

  it('includes og:url when url provided', () => {
    const out = buildMetaTags({
      title: 'Hi',
      description: 'D',
      type: 'website',
      url: 'https://example.com',
    });
    expect(out).toContain('<meta property="og:url" content="https://example.com">');
  });
});

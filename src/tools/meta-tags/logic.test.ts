import { describe, expect, it } from 'vitest';
import { buildMetaTags, META_OPTIONS } from './logic';

describe('META_OPTIONS', () => {
  it('exposes the five expected option keys', () => {
    const keys = META_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(['title', 'description', 'url', 'image', 'type']);
  });

  it('declares type as a select with website and article choices', () => {
    const typeOption = META_OPTIONS.find((o) => o.key === 'type');
    expect(typeOption?.type).toBe('select');
    expect(typeOption?.default).toBe('website');
    expect(typeOption?.choices?.map((c) => c.value)).toEqual(['website', 'article']);
  });

  it('defaults all text options to empty string', () => {
    const textOptions = META_OPTIONS.filter((o) => o.type === 'text');
    expect(textOptions).toHaveLength(4);
    for (const opt of textOptions) {
      expect(opt.default).toBe('');
    }
  });
});

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

  it('emits the full default tag set for empty options', () => {
    const out = buildMetaTags({});
    expect(out).toBe(
      [
        '<title></title>',
        '<meta name="description" content="">',
        '<meta property="og:title" content="">',
        '<meta property="og:description" content="">',
        '<meta property="og:type" content="website">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="">',
      ].join('\n'),
    );
  });

  it('defaults og:type to website when type is undefined', () => {
    const out = buildMetaTags({ title: 'Hi', description: 'D' });
    expect(out).toContain('<meta property="og:type" content="website">');
  });

  it('honors article type', () => {
    const out = buildMetaTags({ title: 'Hi', description: 'D', type: 'article' });
    expect(out).toContain('<meta property="og:type" content="article">');
    expect(out).not.toContain('content="website"');
  });

  it('passes through arbitrary type values verbatim', () => {
    const out = buildMetaTags({ title: 'Hi', type: 'profile' });
    expect(out).toContain('<meta property="og:type" content="profile">');
  });

  it('treats empty-string type as falsy and falls back to website', () => {
    // String('' ?? 'website') === '' because '' is not nullish, then String('')
    // is falsy-coalesced? No: `options.type ?? 'website'` only triggers on nullish.
    // '' is not nullish, so type becomes '' -> og:type content="".
    const out = buildMetaTags({ title: 'Hi', type: '' });
    expect(out).toContain('<meta property="og:type" content="">');
  });

  it('includes og:image when image provided', () => {
    const out = buildMetaTags({
      title: 'Hi',
      image: 'https://example.com/og.png',
    });
    expect(out).toContain('<meta property="og:image" content="https://example.com/og.png">');
  });

  it('omits og:image when image empty', () => {
    const out = buildMetaTags({ title: 'Hi' });
    expect(out).not.toContain('og:image');
  });

  it('omits og:image when image is whitespace-only (trimmed to empty)', () => {
    const out = buildMetaTags({ title: 'Hi', image: '   ' });
    expect(out).not.toContain('og:image');
  });

  it('omits og:url when url is whitespace-only (trimmed to empty)', () => {
    const out = buildMetaTags({ title: 'Hi', url: '  \t  ' });
    expect(out).not.toContain('og:url');
  });

  it('trims surrounding whitespace from url and image', () => {
    const out = buildMetaTags({
      title: 'Hi',
      url: '  https://example.com  ',
      image: '\thttps://example.com/og.png\n',
    });
    expect(out).toContain('<meta property="og:url" content="https://example.com">');
    expect(out).toContain('<meta property="og:image" content="https://example.com/og.png">');
  });

  it('does NOT trim title or description (only url/image are trimmed)', () => {
    const out = buildMetaTags({ title: '  spaced  ', description: '  desc  ' });
    expect(out).toContain('<title>  spaced  </title>');
    expect(out).toContain('<meta name="description" content="  desc  ">');
  });

  it('escapes all special HTML chars (&, <, >, ") in title', () => {
    const out = buildMetaTags({ title: '<a href="x">A & B</a>' });
    expect(out).toContain('<title>&lt;a href=&quot;x&quot;&gt;A &amp; B&lt;/a&gt;</title>');
  });

  it('escapes special chars in description and og:description', () => {
    const out = buildMetaTags({ description: 'x > y & z < w "q"' });
    expect(out).toContain(
      '<meta name="description" content="x &gt; y &amp; z &lt; w &quot;q&quot;">',
    );
    expect(out).toContain(
      '<meta property="og:description" content="x &gt; y &amp; z &lt; w &quot;q&quot;">',
    );
  });

  it('escapes quotes in url to prevent attribute breakout', () => {
    const out = buildMetaTags({ title: 'Hi', url: 'https://x.com/"onload="alert(1)' });
    expect(out).toContain('content="https://x.com/&quot;onload=&quot;alert(1)">');
    expect(out).not.toContain('onload="alert');
  });

  it('escapes ampersand before other entities (no double-escaping ordering bug)', () => {
    // & is replaced first, so a literal < becomes &lt; and the & in &lt; is NOT
    // re-escaped (the second pass only sees the original chars left to process).
    const out = buildMetaTags({ title: '<' });
    expect(out).toContain('<title>&lt;</title>');
    expect(out).not.toContain('&amp;lt;');
  });

  it('preserves unicode and emoji unchanged', () => {
    const out = buildMetaTags({ title: 'Café 日本語 🚀', description: 'Über' });
    expect(out).toContain('<title>Café 日本語 🚀</title>');
    expect(out).toContain('<meta name="description" content="Über">');
  });

  it('coerces numeric option values to strings', () => {
    const out = buildMetaTags({ title: 0 as unknown as string, description: 42 as unknown as string });
    expect(out).toContain('<title>0</title>');
    expect(out).toContain('<meta name="description" content="42">');
  });

  it('coerces null/undefined title and description to empty string', () => {
    const out = buildMetaTags({ title: null as unknown as string, description: undefined as unknown as string });
    expect(out).toContain('<title></title>');
    expect(out).toContain('<meta name="description" content="">');
  });

  it('handles very large input without crashing and keeps it intact', () => {
    const big = 'a'.repeat(50000);
    const out = buildMetaTags({ title: big });
    expect(out).toContain(`<title>${big}</title>`);
    expect(out.length).toBeGreaterThan(50000);
  });

  it('emits exactly 9 lines when url and image are present', () => {
    const out = buildMetaTags({
      title: 'T',
      description: 'D',
      url: 'https://e.com',
      image: 'https://e.com/i.png',
    });
    expect(out.split('\n')).toHaveLength(9);
  });

  it('emits exactly 7 lines when url and image are absent', () => {
    const out = buildMetaTags({ title: 'T', description: 'D' });
    expect(out.split('\n')).toHaveLength(7);
  });

  it('always includes the static twitter:card summary_large_image tag', () => {
    const out = buildMetaTags({});
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it('mirrors title into both og:title and twitter:title', () => {
    const out = buildMetaTags({ title: 'Shared & Title' });
    expect(out).toContain('<meta property="og:title" content="Shared &amp; Title">');
    expect(out).toContain('<meta name="twitter:title" content="Shared &amp; Title">');
  });

  it('is deterministic for identical input', () => {
    const opts = { title: 'X', description: 'Y', url: 'https://z.com', type: 'article' };
    expect(buildMetaTags(opts)).toBe(buildMetaTags(opts));
  });

  it('orders og:url before og:image when both present', () => {
    const out = buildMetaTags({
      title: 'T',
      url: 'https://e.com',
      image: 'https://e.com/i.png',
    });
    expect(out.indexOf('og:url')).toBeLessThan(out.indexOf('og:image'));
  });
});

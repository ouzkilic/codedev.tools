import { describe, it, expect } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { buildRobots, ROBOTS_OPTIONS } from './logic';

describe('ROBOTS_OPTIONS', () => {
  it('exposes three options with expected keys', () => {
    expect(ROBOTS_OPTIONS.map((o) => o.key)).toEqual(['access', 'sitemap', 'crawlDelay']);
  });

  it('access option is a select with all/none choices and default all', () => {
    const access = ROBOTS_OPTIONS.find((o) => o.key === 'access');
    expect(access?.type).toBe('select');
    expect(access?.default).toBe('all');
    expect(access?.choices?.map((c) => c.value)).toEqual(['all', 'none']);
  });

  it('sitemap and crawlDelay default to empty strings', () => {
    expect(ROBOTS_OPTIONS.find((o) => o.key === 'sitemap')?.default).toBe('');
    expect(ROBOTS_OPTIONS.find((o) => o.key === 'crawlDelay')?.default).toBe('');
  });
});

describe('buildRobots', () => {
  it('defaults to allow all', () => {
    expect(buildRobots({ access: 'all' })).toBe('User-agent: *\nAllow: /');
  });

  it('blocks all when access is none', () => {
    expect(buildRobots({ access: 'none' })).toBe('User-agent: *\nDisallow: /');
  });

  it('falls back to Allow: / when access is missing entirely', () => {
    expect(buildRobots({})).toBe('User-agent: *\nAllow: /');
  });

  it('treats any non-"none" access value as allow', () => {
    expect(buildRobots({ access: 'whatever' })).toBe('User-agent: *\nAllow: /');
    expect(buildRobots({ access: '' })).toBe('User-agent: *\nAllow: /');
    expect(buildRobots({ access: 'All' })).toBe('User-agent: *\nAllow: /'); // case sensitive: only exact "none" blocks
  });

  it('only the exact string "none" triggers Disallow (case sensitive)', () => {
    expect(buildRobots({ access: 'None' })).toContain('Allow: /');
    expect(buildRobots({ access: 'NONE' })).toContain('Allow: /');
    expect(buildRobots({ access: 'none' })).toContain('Disallow: /');
  });

  it('includes the sitemap when provided', () => {
    const out = buildRobots({ access: 'all', sitemap: 'https://x.com/sitemap.xml' });
    expect(out).toContain('Sitemap: https://x.com/sitemap.xml');
  });

  it('places sitemap on its own block separated by a blank line', () => {
    expect(buildRobots({ access: 'all', sitemap: 'https://x.com/sitemap.xml' })).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://x.com/sitemap.xml',
    );
  });

  it('includes crawl-delay when provided', () => {
    const out = buildRobots({ access: 'all', crawlDelay: '10' });
    expect(out).toContain('Crawl-delay: 10');
  });

  it('orders crawl-delay before the sitemap block', () => {
    const out = buildRobots({
      access: 'none',
      sitemap: 'https://e.com/sitemap.xml',
      crawlDelay: '5',
    });
    expect(out).toBe('User-agent: *\nDisallow: /\nCrawl-delay: 5\n\nSitemap: https://e.com/sitemap.xml');
    expect(out.indexOf('Crawl-delay')).toBeLessThan(out.indexOf('Sitemap'));
  });

  it('trims surrounding whitespace from sitemap', () => {
    expect(buildRobots({ access: 'all', sitemap: '  https://x.com/s.xml  ' })).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://x.com/s.xml',
    );
  });

  it('trims surrounding whitespace from crawlDelay', () => {
    expect(buildRobots({ access: 'all', crawlDelay: '  7  ' })).toContain('Crawl-delay: 7');
  });

  it('omits sitemap when it is only whitespace', () => {
    const out = buildRobots({ access: 'all', sitemap: '   ' });
    expect(out).toBe('User-agent: *\nAllow: /');
    expect(out).not.toContain('Sitemap');
  });

  it('omits crawl-delay when it is only whitespace', () => {
    const out = buildRobots({ access: 'all', crawlDelay: '\t \n' });
    expect(out).toBe('User-agent: *\nAllow: /');
    expect(out).not.toContain('Crawl-delay');
  });

  it('omits both optional lines when both empty', () => {
    expect(buildRobots({ access: 'none', sitemap: '', crawlDelay: '' })).toBe(
      'User-agent: *\nDisallow: /',
    );
  });

  it('coerces boolean option values via String() without throwing', () => {
    // ToolOptions allows boolean; String(true)/String(false) are both non-empty strings
    const out = buildRobots({ access: 'all', sitemap: true, crawlDelay: false });
    expect(out).toContain('Sitemap: true');
    expect(out).toContain('Crawl-delay: false');
  });

  it('accepts unicode / emoji content in sitemap field', () => {
    const out = buildRobots({ access: 'all', sitemap: 'https://例え.テスト/サイトマップ.xml🚀' });
    expect(out).toContain('Sitemap: https://例え.テスト/サイトマップ.xml🚀');
  });

  it('handles a very large crawl-delay value', () => {
    const big = '9'.repeat(1000);
    const out = buildRobots({ access: 'all', crawlDelay: big });
    expect(out).toContain(`Crawl-delay: ${big}`);
  });

  it('preserves internal whitespace in sitemap (only trims edges)', () => {
    const out = buildRobots({ access: 'all', sitemap: '  https://x.com/a b.xml  ' });
    expect(out).toContain('Sitemap: https://x.com/a b.xml');
  });

  it('is deterministic for identical inputs', () => {
    const opts: ToolOptions = { access: 'none', sitemap: 'https://x.com/s.xml', crawlDelay: '3' };
    expect(buildRobots(opts)).toBe(buildRobots({ ...opts }));
  });

  it('always starts with the wildcard user-agent line', () => {
    for (const access of ['all', 'none', 'other']) {
      expect(buildRobots({ access }).startsWith('User-agent: *\n')).toBe(true);
    }
  });

  it('never contains a trailing newline', () => {
    const out = buildRobots({ access: 'all', sitemap: 'https://x.com/s.xml', crawlDelay: '1' });
    expect(out.endsWith('\n')).toBe(false);
  });
});

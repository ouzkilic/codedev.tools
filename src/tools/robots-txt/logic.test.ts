import { describe, it, expect } from 'vitest';
import { buildRobots } from './logic';

describe('buildRobots', () => {
  it('defaults to allow all', () => {
    expect(buildRobots({ access: 'all' })).toBe('User-agent: *\nAllow: /');
  });

  it('blocks all when access is none', () => {
    expect(buildRobots({ access: 'none' })).toContain('Disallow: /');
  });

  it('includes the sitemap when provided', () => {
    const out = buildRobots({ access: 'all', sitemap: 'https://x.com/sitemap.xml' });
    expect(out).toContain('Sitemap: https://x.com/sitemap.xml');
  });

  it('includes crawl-delay when provided', () => {
    const out = buildRobots({ access: 'all', crawlDelay: '10' });
    expect(out).toContain('Crawl-delay: 10');
  });
});

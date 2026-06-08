import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const ROBOTS_OPTIONS: ToolOption[] = [
  {
    key: 'access',
    label: 'Access',
    type: 'select',
    choices: [
      { value: 'all', label: 'Allow all' },
      { value: 'none', label: 'Block all' },
    ],
    default: 'all',
  },
  { key: 'sitemap', label: 'Sitemap URL', type: 'text', default: '', placeholder: 'https://example.com/sitemap.xml' },
  { key: 'crawlDelay', label: 'Crawl delay', type: 'text', default: '', placeholder: '10' },
];

export function buildRobots(options: ToolOptions): string {
  const access = String(options.access ?? 'all');
  const sitemap = String(options.sitemap ?? '').trim();
  const crawlDelay = String(options.crawlDelay ?? '').trim();

  const lines = ['User-agent: *', access === 'none' ? 'Disallow: /' : 'Allow: /'];
  if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
  if (sitemap) lines.push('', `Sitemap: ${sitemap}`);

  return lines.join('\n');
}

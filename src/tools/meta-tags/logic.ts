import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const META_OPTIONS: ToolOption[] = [
  { key: 'title', label: 'Title', type: 'text', default: '', placeholder: 'Page title' },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    default: '',
    placeholder: 'Page description',
  },
  { key: 'url', label: 'URL', type: 'text', default: '', placeholder: 'https://example.com' },
  {
    key: 'image',
    label: 'Image',
    type: 'text',
    default: '',
    placeholder: 'https://example.com/og.png',
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    default: 'website',
    choices: [
      { value: 'website', label: 'Website' },
      { value: 'article', label: 'Article' },
    ],
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildMetaTags(options: ToolOptions): string {
  const title = escapeHtml(String(options.title ?? ''));
  const description = escapeHtml(String(options.description ?? ''));
  const url = escapeHtml(String(options.url ?? '').trim());
  const image = escapeHtml(String(options.image ?? '').trim());
  const type = escapeHtml(String(options.type ?? 'website'));

  const lines = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:type" content="${type}">`,
  ];
  if (url) lines.push(`<meta property="og:url" content="${url}">`);
  if (image) lines.push(`<meta property="og:image" content="${image}">`);
  lines.push('<meta name="twitter:card" content="summary_large_image">');
  lines.push(`<meta name="twitter:title" content="${title}">`);

  return lines.join('\n');
}

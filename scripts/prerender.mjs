// Build-time prerender. Runs after `vite build` (postbuild). For each tool it writes
// dist/tool/<id>/index.html with route-specific <head> tags (title/description/canonical/
// OG/Twitter) + JSON-LD, plus a crawler-only body block with real, indexable content.
// This does NOT break the client-only constraint — it is static HTML generated at build
// time from local metadata; no runtime backend, no user data involved. The SPA removes the
// crawler block on boot (see src/main.tsx).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolsDir = join(root, 'src', 'tools');
const distDir = join(root, 'dist');
const BASE = 'https://codedev.tools';

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('prerender: dist/index.html not found — run after `vite build`.');
  process.exit(1);
}

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escJsonLd = (s) => s.replace(/</g, '\\u003c');

// Match a quoted string value, handling either quote style and escaped quotes inside.
const field = (src, key) => {
  const m = src.match(new RegExp(`${key}:\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`));
  return m ? m[2].replace(/\\(['"])/g, '$1') : '';
};

// Category labels (parsed from categories.ts to stay in sync).
const catSrc = readFileSync(join(toolsDir, 'categories.ts'), 'utf8');
const catLabels = {};
for (const m of catSrc.matchAll(/['"]?([\w-]+)['"]?:\s*\{\s*label:\s*'([^']+)'/g)) {
  catLabels[m[1]] = m[2];
}

// SEO content (intro / useCases / faq): one file per tool under src/data/seo/<id>.json.
const seoContent = {};
const seoDir = join(root, 'src', 'data', 'seo');
if (existsSync(seoDir)) {
  for (const f of readdirSync(seoDir)) {
    if (!f.endsWith('.json')) continue;
    try {
      seoContent[f.slice(0, -5)] = JSON.parse(readFileSync(join(seoDir, f), 'utf8'));
    } catch {
      // skip malformed file
    }
  }
}

// Collect tool metadata.
const tools = [];
for (const entry of readdirSync(toolsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const metaPath = join(toolsDir, entry.name, 'meta.ts');
  if (!existsSync(metaPath)) continue;
  const src = readFileSync(metaPath, 'utf8');
  const id = field(src, 'id');
  if (!id) continue;
  tools.push({
    id,
    title: field(src, 'title'),
    description: field(src, 'description'),
    category: field(src, 'category'),
  });
}
tools.sort((a, b) => a.id.localeCompare(b.id));

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

// Replace a <meta name|property="key" content="..."> value, or insert it before </head>.
function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}=["']${key}["']\\s+content=)["'][^"']*["']`, 'i');
  if (re.test(html)) return html.replace(re, `$1"${escAttr(value)}"`);
  return html.replace('</head>', `    <meta ${attr}="${key}" content="${escAttr(value)}" />\n  </head>`);
}

function setCanonical(html, href) {
  const re = /(<link\s+rel=["']canonical["']\s+href=)["'][^"']*["']/i;
  if (re.test(html)) return html.replace(re, `$1"${escAttr(href)}"`);
  return html.replace('</head>', `    <link rel="canonical" href="${escAttr(href)}" />\n  </head>`);
}

function jsonLd(tool, url) {
  const seo = seoContent[tool.id] ?? {};
  const graph = [
    {
      '@type': 'SoftwareApplication',
      name: tool.title,
      url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (web browser)',
      description: seo.intro ?? tool.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: catLabels[tool.category] ?? tool.category, item: url },
        { '@type': 'ListItem', position: 3, name: tool.title, item: url },
      ],
    },
  ];
  if (Array.isArray(seo.faq) && seo.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: seo.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return escJsonLd(JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }));
}

// Crawler-only content block (removed by the app on boot).
function seoBlock(tool) {
  const seo = seoContent[tool.id] ?? {};
  const intro = seo.intro ?? tool.description;
  const parts = [`<h1>${escHtml(tool.title)}</h1>`, `<p>${escHtml(tool.description)}</p>`];
  if (intro !== tool.description) parts.push(`<p>${escHtml(intro)}</p>`);
  if (Array.isArray(seo.useCases) && seo.useCases.length) {
    parts.push('<h2>Common uses</h2><ul>' + seo.useCases.map((u) => `<li>${escHtml(u)}</li>`).join('') + '</ul>');
  }
  if (Array.isArray(seo.faq) && seo.faq.length) {
    parts.push('<h2>FAQ</h2>' + seo.faq.map((f) => `<h3>${escHtml(f.q)}</h3><p>${escHtml(f.a)}</p>`).join(''));
  }
  const related = tools.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 8);
  if (related.length) {
    parts.push('<h2>Related tools</h2><ul>' + related.map((t) => `<li><a href="/tool/${t.id}">${escHtml(t.title)}</a></li>`).join('') + '</ul>');
  }
  return `<div id="prerendered-seo" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">${parts.join('')}</div>`;
}

let count = 0;
for (const tool of tools) {
  const url = `${BASE}/tool/${tool.id}`;
  const fullTitle = `${tool.title} · codedev.tools`;
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escHtml(fullTitle)}</title>`);
  html = setMeta(html, 'name', 'description', tool.description);
  html = setMeta(html, 'property', 'og:title', fullTitle);
  html = setMeta(html, 'property', 'og:description', tool.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', fullTitle);
  html = setMeta(html, 'name', 'twitter:description', tool.description);
  html = setCanonical(html, url);
  html = html.replace('</head>', `    <script type="application/ld+json" data-tool-ld>${jsonLd(tool, url)}</script>\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${seoBlock(tool)}`);

  const outDir = join(distDir, 'tool', tool.id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
  count++;
}

// Homepage: inject a crawler-only directory of all tools grouped by category.
const homeGroups = {};
for (const t of tools) (homeGroups[t.category] ??= []).push(t);
const homeBlockParts = ['<h1>codedev.tools — developer tools that run in your browser</h1>'];
for (const cat of Object.keys(catLabels)) {
  const items = homeGroups[cat];
  if (!items || !items.length) continue;
  homeBlockParts.push(`<h2>${escHtml(catLabels[cat])}</h2><ul>` +
    items.map((t) => `<li><a href="/tool/${t.id}">${escHtml(t.title)}</a> — ${escHtml(t.description)}</li>`).join('') +
    '</ul>');
}
const homeBlock = `<div id="prerendered-seo" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">${homeBlockParts.join('')}</div>`;
const home = template.replace('<div id="root"></div>', `<div id="root"></div>\n    ${homeBlock}`);
writeFileSync(join(distDir, 'index.html'), home);

console.log(`prerender: wrote ${count} tool pages + homepage directory.`);

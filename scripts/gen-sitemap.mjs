// Build-time sitemap generator. Reads `id`s from src/tools/*/meta.ts files and
// writes public/sitemap.xml. Does not break the client-only constraint (runs only at build time).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolsDir = join(root, 'src', 'tools');
const BASE = 'https://codedev.tools';

const ids = [];
for (const entry of readdirSync(toolsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const metaPath = join(toolsDir, entry.name, 'meta.ts');
  try {
    const src = readFileSync(metaPath, 'utf8');
    const m = src.match(/id:\s*['"]([^'"]+)['"]/);
    if (m) ids.push(m[1]);
  } catch {
    // skip if meta.ts is missing
  }
}
ids.sort();

const urls = [
  { loc: `${BASE}/`, priority: '1.0' },
  ...ids.map((id) => ({ loc: `${BASE}/tool/${id}`, priority: '0.8' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log(`sitemap.xml generated (${urls.length} URLs).`);

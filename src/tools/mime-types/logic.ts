import type { ToolLogic } from '@/hooks/useToolState';

const MIME: Record<string, string> = {
  json: 'application/json', xml: 'application/xml', html: 'text/html', htm: 'text/html',
  css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', txt: 'text/plain',
  csv: 'text/csv', md: 'text/markdown', yaml: 'application/yaml', yml: 'application/yaml',
  pdf: 'application/pdf', zip: 'application/zip', gz: 'application/gzip', tar: 'application/x-tar',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  svg: 'image/svg+xml', ico: 'image/x-icon', bmp: 'image/bmp', avif: 'image/avif',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', mp4: 'video/mp4', webm: 'video/webm',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  wasm: 'application/wasm', bin: 'application/octet-stream', doc: 'application/msword',
  xls: 'application/vnd.ms-excel', ppt: 'application/vnd.ms-powerpoint',
};

export const mimeTypesLogic: ToolLogic = {
  transform(input: string): string {
    const q = input.trim().toLowerCase().replace(/^\./, '');
    if (MIME[q]) return `.${q} → ${MIME[q]}`;
    const byMime = Object.entries(MIME).filter(([, m]) => m.includes(q));
    if (byMime.length > 0) return byMime.map(([ext, m]) => `.${ext} → ${m}`).join('\n');
    throw new Error('No matching MIME type or extension.');
  },
};

import { describe, it, expect } from 'vitest';
import { mimeTypesLogic } from './logic';

describe('mimeTypes', () => {
  // --- exact extension lookups (happy paths) ---
  it('looks up by extension', () => {
    expect(mimeTypesLogic.transform('json')).toBe('.json → application/json');
  });

  it('ignores a leading dot', () => {
    expect(mimeTypesLogic.transform('.png')).toBe('.png → image/png');
  });

  it('resolves a representative extension from each major group', () => {
    expect(mimeTypesLogic.transform('html')).toBe('.html → text/html');
    expect(mimeTypesLogic.transform('css')).toBe('.css → text/css');
    expect(mimeTypesLogic.transform('pdf')).toBe('.pdf → application/pdf');
    expect(mimeTypesLogic.transform('mp3')).toBe('.mp3 → audio/mpeg');
    expect(mimeTypesLogic.transform('mp4')).toBe('.mp4 → video/mp4');
    expect(mimeTypesLogic.transform('woff2')).toBe('.woff2 → font/woff2');
    expect(mimeTypesLogic.transform('wasm')).toBe('.wasm → application/wasm');
  });

  it('maps aliased extensions to the same mime type', () => {
    expect(mimeTypesLogic.transform('htm')).toBe('.htm → text/html');
    expect(mimeTypesLogic.transform('html')).toBe('.html → text/html');
    expect(mimeTypesLogic.transform('jpg')).toBe('.jpg → image/jpeg');
    expect(mimeTypesLogic.transform('jpeg')).toBe('.jpeg → image/jpeg');
    expect(mimeTypesLogic.transform('yaml')).toBe('.yaml → application/yaml');
    expect(mimeTypesLogic.transform('yml')).toBe('.yml → application/yaml');
    expect(mimeTypesLogic.transform('js')).toBe('.js → text/javascript');
    expect(mimeTypesLogic.transform('mjs')).toBe('.mjs → text/javascript');
  });

  it('falls back to octet-stream for the bin extension', () => {
    expect(mimeTypesLogic.transform('bin')).toBe('.bin → application/octet-stream');
  });

  // --- normalization of the query ---
  it('is case insensitive for the extension', () => {
    expect(mimeTypesLogic.transform('JSON')).toBe('.json → application/json');
    expect(mimeTypesLogic.transform('PnG')).toBe('.png → image/png');
  });

  it('trims surrounding whitespace before lookup', () => {
    expect(mimeTypesLogic.transform('  svg  ')).toBe('.svg → image/svg+xml');
  });

  it('strips a leading dot combined with whitespace and casing', () => {
    expect(mimeTypesLogic.transform('  .GIF ')).toBe('.gif → image/gif');
  });

  it('only strips a single leading dot', () => {
    // '..png' -> trim -> '.png' after stripping one leading dot,
    // which is not a key and no mime contains '.png', so it throws.
    expect(() => mimeTypesLogic.transform('..png')).toThrow();
  });

  // --- substring search against mime values ---
  it('searches by mime substring and lists all image types in insertion order', () => {
    const out = mimeTypesLogic.transform('image/');
    expect(out).toBe(
      [
        '.png → image/png',
        '.jpg → image/jpeg',
        '.jpeg → image/jpeg',
        '.gif → image/gif',
        '.webp → image/webp',
        '.svg → image/svg+xml',
        '.ico → image/x-icon',
        '.bmp → image/bmp',
        '.avif → image/avif',
      ].join('\n'),
    );
  });

  it('lists all font types for a font/ search', () => {
    const out = mimeTypesLogic.transform('font/');
    expect(out).toBe(
      ['.woff → font/woff', '.woff2 → font/woff2', '.ttf → font/ttf', '.otf → font/otf'].join('\n'),
    );
  });

  it('returns a single match when the mime substring is unique', () => {
    expect(mimeTypesLogic.transform('audio/mpeg')).toBe('.mp3 → audio/mpeg');
    expect(mimeTypesLogic.transform('vnd.ms-excel')).toBe('.xls → application/vnd.ms-excel');
  });

  it('treats a full mime value as a substring search (not an extension key)', () => {
    expect(mimeTypesLogic.transform('video/mp4')).toBe('.mp4 → video/mp4');
  });

  it('matches a partial mime fragment across multiple entries', () => {
    const out = mimeTypesLogic.transform('javascript');
    expect(out).toBe(['.js → text/javascript', '.mjs → text/javascript'].join('\n'));
  });

  it('prefers an exact extension key over substring search', () => {
    // 'css' is a key -> single arrow line, not a multi-line mime search.
    const out = mimeTypesLogic.transform('css');
    expect(out).toBe('.css → text/css');
    expect(out).not.toContain('\n');
  });

  // --- empty / whitespace inputs: empty query matches every mime value ---
  it('returns every entry for an empty query (every mime contains "")', () => {
    const out = mimeTypesLogic.transform('');
    const lines = out.split('\n');
    expect(lines.length).toBe(Object.keys({
      json: 1, xml: 1, html: 1, htm: 1, css: 1, js: 1, mjs: 1, txt: 1, csv: 1, md: 1,
      yaml: 1, yml: 1, pdf: 1, zip: 1, gz: 1, tar: 1, png: 1, jpg: 1, jpeg: 1, gif: 1,
      webp: 1, svg: 1, ico: 1, bmp: 1, avif: 1, mp3: 1, wav: 1, ogg: 1, mp4: 1, webm: 1,
      woff: 1, woff2: 1, ttf: 1, otf: 1, wasm: 1, bin: 1, doc: 1, xls: 1, ppt: 1,
    }).length);
    expect(lines[0]).toBe('.json → application/json');
    expect(out).toContain('.ppt → application/vnd.ms-powerpoint');
  });

  it('whitespace-only input behaves like an empty query', () => {
    expect(mimeTypesLogic.transform('   ')).toBe(mimeTypesLogic.transform(''));
  });

  // --- error paths ---
  it('throws when nothing matches', () => {
    expect(() => mimeTypesLogic.transform('zzz')).toThrow();
  });

  it('throws a descriptive error message for an unknown token', () => {
    expect(() => mimeTypesLogic.transform('no-such-thing')).toThrow(
      'No matching MIME type or extension.',
    );
  });

  it('throws for unicode / emoji input that matches nothing', () => {
    expect(() => mimeTypesLogic.transform('😀')).toThrow();
    expect(() => mimeTypesLogic.transform('файл')).toThrow();
  });

  it('throws for numeric and special-char input that matches nothing', () => {
    expect(() => mimeTypesLogic.transform('12345')).toThrow();
    expect(() => mimeTypesLogic.transform('@#$%')).toThrow();
  });

  // --- determinism ---
  it('is deterministic for repeated identical queries', () => {
    const a = mimeTypesLogic.transform('image/');
    const b = mimeTypesLogic.transform('image/');
    expect(a).toBe(b);
  });

  it('handles very large input without matching', () => {
    const big = 'x'.repeat(100000);
    expect(() => mimeTypesLogic.transform(big)).toThrow();
  });
});

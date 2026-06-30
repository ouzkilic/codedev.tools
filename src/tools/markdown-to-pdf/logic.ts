import { marked } from 'marked';

export type PageSize = 'a4' | 'letter' | 'legal';
export type MarginSize = 'narrow' | 'normal' | 'wide' | 'none';

/** CSS `@page size` keyword for each page-size option. */
export const PAGE_SIZES: Record<PageSize, string> = {
  a4: 'A4',
  letter: 'letter',
  legal: 'legal',
};

/** Page margin, applied via `@page` for print and as body padding for the on-screen iframe. */
export const MARGINS: Record<MarginSize, string> = {
  narrow: '12mm',
  normal: '20mm',
  wide: '28mm',
  none: '0',
};

export interface DocumentOptions {
  pageSize: PageSize;
  margin: MarginSize;
  /** Becomes the document <title>; browsers use it as the default "Save as PDF" filename. */
  title?: string;
}

/**
 * Markdown -> HTML. GFM (tables, strikethrough, autolinks) is enabled by default in marked.
 * The result is untrusted and MUST be sanitized before it is inserted into any document.
 */
export function renderMarkdownToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/** Derive a document title from the first heading, falling back to the first non-empty line. */
export function deriveTitle(md: string, fallback = 'document'): string {
  const lines = md.split('\n');
  for (const raw of lines) {
    // ATX heading; an optional closing run of #s must be space-separated (CommonMark).
    const m = raw.trim().match(/^#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/);
    if (m && m[1].trim()) return m[1].trim();
  }
  for (const raw of lines) {
    const line = raw.trim();
    if (line) return line.slice(0, 120);
  }
  return fallback;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Print-optimised, GitHub-flavoured document stylesheet. */
function documentCss(size: string, margin: string): string {
  return `
    *, *::before, *::after { box-sizing: border-box; }
    /* margin:0 leaves the browser no room to draw its own print headers/footers
       (URL, date, title, page number). Page margins come from the layout table below. */
    @page { size: ${size}; margin: 0; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      color: #1f2328;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Page geometry without an @page margin: browsers repeat a table's <thead> and
       <tfoot> at the top and bottom of every page the table spans. The spacer rows
       therefore reserve identical top/bottom margins on EVERY page (including pages
       2+), while the content cell's horizontal padding supplies the left/right
       margins. No @page margin means the browser prints no headers or footers. */
    table.page { width: 100%; border-collapse: collapse; }
    table.page > thead > tr > td,
    table.page > tfoot > tr > td { padding: 0; border: 0; }
    table.page .spacer { height: ${margin}; }
    table.page > tbody > tr > td.content { padding: 0 ${margin}; border: 0; vertical-align: top; }

    .content { overflow-wrap: break-word; }
    .content > :first-child { margin-top: 0; }
    .content > :last-child { margin-bottom: 0; }

    .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 { line-height: 1.25; font-weight: 600; margin: 1.4em 0 0.6em; break-after: avoid; }
    .content h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid #d0d7de; }
    .content h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid #d0d7de; }
    .content h3 { font-size: 1.25em; }
    .content h4 { font-size: 1em; }
    .content h5 { font-size: .875em; }
    .content h6 { font-size: .85em; color: #59636e; }

    .content p { margin: 0 0 1em; }
    .content a { color: #0969da; text-decoration: underline; }
    .content strong { font-weight: 600; }
    .content em { font-style: italic; }

    .content ul, .content ol { margin: 0 0 1em; padding-left: 2em; }
    .content li { margin: .25em 0; }
    .content li > ul, .content li > ol { margin: .25em 0; }

    .content blockquote { margin: 0 0 1em; padding: 0 1em; color: #59636e; border-left: .25em solid #d0d7de; }

    .content code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; font-size: .9em; background: #eff1f3; padding: .2em .4em; border-radius: 6px; }
    .content pre { background: #f6f8fa; padding: 1em; border-radius: 6px; overflow: auto; margin: 0 0 1em; break-inside: avoid; }
    .content pre code { background: transparent; padding: 0; }

    .content table { border-collapse: collapse; width: 100%; margin: 0 0 1em; break-inside: avoid; }
    .content th, .content td { border: 1px solid #d0d7de; padding: .5em .75em; text-align: left; }
    .content th { background: #f6f8fa; font-weight: 600; }
    .content tbody tr:nth-child(2n) td { background: #f6f8fa; }

    .content img { max-width: 100%; height: auto; }
    .content hr { height: 1px; border: 0; background: #d0d7de; margin: 1.6em 0; }

    @media print {
      .content pre, .content blockquote, .content table, .content img { break-inside: avoid; }
    }
  `;
}

/**
 * Wrap sanitized body HTML in a complete, self-contained HTML document ready to print to PDF.
 * `bodyHtml` must already be sanitized (e.g. via DOMPurify) by the caller.
 */
export function buildDocument(bodyHtml: string, opts: DocumentOptions): string {
  const size = PAGE_SIZES[opts.pageSize] ?? PAGE_SIZES.a4;
  const margin = MARGINS[opts.margin] ?? MARGINS.normal;
  const title = escapeHtml((opts.title ?? 'document').trim() || 'document');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${documentCss(size, margin)}</style>
</head>
<body>
<table class="page" role="presentation">
<thead><tr><td><div class="spacer"></div></td></tr></thead>
<tbody><tr><td class="content">${bodyHtml}</td></tr></tbody>
<tfoot><tr><td><div class="spacer"></div></td></tr></tfoot>
</table>
</body>
</html>`;
}

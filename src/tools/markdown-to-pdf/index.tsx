import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { FileDown } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import {
  buildDocument,
  deriveTitle,
  renderMarkdownToHtml,
  type MarginSize,
  type PageSize,
} from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'pageSize',
    label: 'Page',
    type: 'select',
    default: 'a4',
    choices: [
      { value: 'a4', label: 'A4' },
      { value: 'letter', label: 'Letter' },
      { value: 'legal', label: 'Legal' },
    ],
  },
  {
    key: 'margin',
    label: 'Margins',
    type: 'select',
    default: 'normal',
    choices: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'normal', label: 'Normal' },
      { value: 'wide', label: 'Wide' },
      { value: 'none', label: 'None' },
    ],
  },
];

const SAMPLE = `# Project Title

A short paragraph describing **what this is**. Markdown renders here and
exports to a clean, multi-page PDF.

## Features

- Headings, **bold**, *italic*, and \`inline code\`
- Ordered and unordered lists
- Tables, blockquotes, and code blocks

> Everything runs in your browser — nothing is uploaded.

\`\`\`ts
const greeting = 'hello, pdf';
\`\`\`

| Page size | Margins |
| --------- | ------- |
| A4        | Normal  |
| Letter    | Narrow  |
`;

// Print the given HTML document via a hidden, same-origin iframe. The browser's
// print dialog lets the user choose "Save as PDF". No new window, no popup blocker.
function printDocument(html: string) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

  const remove = () => iframe.remove();
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return remove();
    // Clean up once printing finishes or is cancelled; keep a safety fallback.
    win.addEventListener('afterprint', () => setTimeout(remove, 100), { once: true });
    setTimeout(remove, 60_000);
    win.focus();
    win.print();
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
}

const PREVIEW_PROSE =
  'text-[13px] leading-relaxed text-zinc-900 ' +
  '[&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:border-b [&_h1]:border-zinc-200 [&_h1]:pb-2 [&_h1]:text-2xl [&_h1]:font-semibold ' +
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-1 [&_h2]:text-xl [&_h2]:font-semibold ' +
  '[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-semibold ' +
  '[&_p]:my-3 [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 ' +
  '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-600 ' +
  '[&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] ' +
  '[&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:bg-zinc-50 [&_pre]:p-4 ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
  '[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse ' +
  '[&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold ' +
  '[&_td]:border [&_td]:border-zinc-200 [&_td]:px-3 [&_td]:py-1.5 ' +
  '[&_img]:max-w-full [&_hr]:my-6 [&_hr]:border-zinc-200';

export default function MarkdownToPdf() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Values>({ pageSize: 'a4', margin: 'normal' });
  const debounced = useDebouncedValue(input, 200);

  const previewHtml = useMemo(() => {
    if (!debounced.trim()) return '';
    return DOMPurify.sanitize(renderMarkdownToHtml(debounced));
  }, [debounced]);

  const exportPdf = () => {
    if (!input.trim()) return;
    const safeBody = DOMPurify.sanitize(renderMarkdownToHtml(input));
    const html = buildDocument(safeBody, {
      pageSize: options.pageSize as PageSize,
      margin: options.margin as MarginSize,
      title: deriveTitle(input),
    });
    printDocument(html);
  };

  return (
    <TwoPaneLayout
      toolbar={
        <ToolOptions
          defs={OPTION_DEFS}
          values={options}
          onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))}
        />
      }
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder={SAMPLE}
        />
      }
      right={
        <div
          className="h-full overflow-auto rounded-md border bg-zinc-100 p-4 dark:bg-zinc-800/40"
          style={{ minHeight: 320 }}
        >
          {previewHtml ? (
            <div className="mx-auto max-w-[760px] rounded-sm bg-white p-8 shadow-sm">
              <div className={PREVIEW_PROSE} dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Type Markdown on the left to preview the PDF here…
            </div>
          )}
        </div>
      }
      actions={
        <Button variant="outline" size="sm" onClick={exportPdf} disabled={!input.trim()}>
          <FileDown className="mr-1 size-4" /> Export PDF
        </Button>
      }
    />
  );
}

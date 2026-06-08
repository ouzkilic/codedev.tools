import { marked } from 'marked';

// Markdown -> HTML (sanitized in the component before rendering).
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

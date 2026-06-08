import { DOMParser } from '@xmldom/xmldom';
import xpath from 'xpath';
import type { ToolLogic } from '@/hooks/useToolState';

function nodeToString(n: unknown): string {
  if (n && typeof n === 'object' && 'nodeValue' in n) {
    const v = (n as { nodeValue: unknown }).nodeValue;
    if (v != null) return String(v);
  }
  return String(n);
}

export const xpathLogic: ToolLogic = {
  options: [
    { key: 'query', label: 'XPath', type: 'text', default: '', placeholder: '//book/title/text()' },
  ],
  transform(input, ctx) {
    const query = String(ctx?.options.query ?? '').trim();
    if (!query) return 'Enter an XPath expression in the toolbar.';
    const doc = new DOMParser().parseFromString(input, 'text/xml');
    const result = xpath.select(query, doc as unknown as Node);
    if (Array.isArray(result)) {
      if (result.length === 0) return 'No matches.';
      return result.map(nodeToString).join('\n');
    }
    return String(result);
  },
};

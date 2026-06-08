import type { ToolLogic } from '@/hooks/useToolState';

export const htmlStripLogic: ToolLogic = {
  transform(input: string): string {
    const stripped = input.replace(/<[^>]*>/g, '');
    const decoded = stripped
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    return decoded.replace(/(\n\s*){3,}/g, '\n\n').trim();
  },
};

import { marked } from 'marked';
import type { ToolLogic } from '@/hooks/useToolState';

export const markdownToHtmlLogic: ToolLogic = {
  transform(input: string): string {
    // Synchronous parse; output is shown as text (not rendered), so it's safe.
    return marked.parse(input, { async: false }) as string;
  },
};

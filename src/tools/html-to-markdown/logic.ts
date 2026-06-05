import TurndownService from 'turndown';
import type { ToolLogic } from '@/hooks/useToolState';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export const htmlToMarkdownLogic: ToolLogic = {
  transform(input: string): string {
    return turndown.turndown(input);
  },
};

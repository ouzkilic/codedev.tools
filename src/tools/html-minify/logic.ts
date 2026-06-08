import type { ToolLogic } from '@/hooks/useToolState';

export const htmlMinifyLogic: ToolLogic = {
  transform(input: string): string {
    return input
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  },
};

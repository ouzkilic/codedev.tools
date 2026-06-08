import type { ToolLogic } from '@/hooks/useToolState';

export const svgOptimizeLogic: ToolLogic = {
  transform(input: string): string {
    return input
      .replace(/<\?xml[\s\S]*?\?>/g, '')
      .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  },
};

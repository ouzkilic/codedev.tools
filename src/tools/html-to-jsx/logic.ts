import type { ToolLogic } from '@/hooks/useToolState';

const VOID_ELEMENTS =
  'br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr';

export const htmlToJsxLogic: ToolLogic = {
  transform(input: string): string {
    return input
      .replace(/\bclass=/g, 'className=')
      .replace(/\bfor=/g, 'htmlFor=')
      .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
      .replace(
        new RegExp(`<(${VOID_ELEMENTS})((?:[^>]*?))(?<!/)>`, 'gi'),
        '<$1$2 />',
      );
  },
};

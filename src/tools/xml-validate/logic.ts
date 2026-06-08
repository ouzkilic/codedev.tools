import type { ToolLogic } from '@/hooks/useToolState';
import { XMLValidator } from 'fast-xml-parser';

export const xmlValidateLogic: ToolLogic = {
  transform(input: string): string {
    const v = XMLValidator.validate(input);
    if (v === true) return '✓ Valid XML.';
    throw new Error(v.err.msg);
  },
};

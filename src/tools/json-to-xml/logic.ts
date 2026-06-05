import { XMLBuilder } from 'fast-xml-parser';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToXmlLogic: ToolLogic = {
  transform(input: string): string {
    const obj = JSON.parse(input);
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '  ',
    });
    return builder.build(obj).trimEnd();
  },
};

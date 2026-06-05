import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { ToolLogic } from '@/hooks/useToolState';

export const xmlToJsonLogic: ToolLogic = {
  transform(input: string): string {
    const valid = XMLValidator.validate(input);
    if (valid !== true) throw new Error(valid.err.msg);
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    return JSON.stringify(parser.parse(input), null, 2);
  },
};

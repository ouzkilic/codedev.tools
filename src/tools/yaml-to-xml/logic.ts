import yaml from 'js-yaml';
import { XMLBuilder } from 'fast-xml-parser';
import type { ToolLogic } from '@/hooks/useToolState';

export const yamlToXmlLogic: ToolLogic = {
  transform(input: string): string {
    const obj = yaml.load(input);
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error('YAML must be a top-level mapping.');
    }
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '  ',
    });
    return builder.build(obj).trimEnd();
  },
};

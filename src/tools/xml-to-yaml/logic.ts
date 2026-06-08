import type { ToolLogic } from '@/hooks/useToolState';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import yaml from 'js-yaml';

export const xmlToYamlLogic: ToolLogic = {
  transform(input) {
    const v = XMLValidator.validate(input);
    if (v !== true) throw new Error(v.err.msg);
    const obj = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(input);
    return yaml.dump(obj);
  },
};

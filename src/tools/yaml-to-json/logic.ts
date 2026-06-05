import yaml from 'js-yaml';
import type { ToolLogic } from '@/hooks/useToolState';

export const yamlToJsonLogic: ToolLogic = {
  transform(input: string): string {
    return JSON.stringify(yaml.load(input), null, 2);
  },
};

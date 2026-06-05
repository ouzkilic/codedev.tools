import yaml from 'js-yaml';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToYamlLogic: ToolLogic = {
  transform(input: string): string {
    return yaml.dump(JSON.parse(input));
  },
};

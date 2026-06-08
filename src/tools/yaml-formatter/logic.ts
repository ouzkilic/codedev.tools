import type { ToolLogic } from '@/hooks/useToolState';
import yaml from 'js-yaml';
export const yamlFormatterLogic: ToolLogic = {
  transform(input: string): string {
    return yaml.dump(yaml.load(input), { indent: 2, lineWidth: -1 });
  },
};

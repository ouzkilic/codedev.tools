import yaml from 'js-yaml';
import type { ToolLogic } from '@/hooks/useToolState';

export const yamlValidateLogic: ToolLogic = {
  transform(input: string): string {
    yaml.load(input); // throws YAMLException on invalid input
    return '✓ Valid YAML.';
  },
};

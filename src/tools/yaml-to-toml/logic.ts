import type { ToolLogic } from '@/hooks/useToolState';
import yaml from 'js-yaml';
import { stringify } from 'smol-toml';

export const yamlToTomlLogic: ToolLogic = {
  transform(input: string): string {
    const obj = yaml.load(input);
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error('YAML must describe a top-level mapping for TOML.');
    }
    return stringify(obj as Record<string, unknown>);
  },
};

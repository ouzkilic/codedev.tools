import type { ToolLogic } from '@/hooks/useToolState';
import { parse } from 'smol-toml';
import yaml from 'js-yaml';

export const tomlToYamlLogic: ToolLogic = {
  transform(input: string): string {
    if (!input.trim()) return '';
    try {
      return yaml.dump(parse(input));
    } catch (e) {
      throw new Error(`Invalid TOML: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
    }
  },
};

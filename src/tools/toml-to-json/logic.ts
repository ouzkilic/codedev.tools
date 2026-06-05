import { parse } from 'smol-toml';
import type { ToolLogic } from '@/hooks/useToolState';

export const tomlToJsonLogic: ToolLogic = {
  transform(input: string): string {
    return JSON.stringify(parse(input), null, 2);
  },
};

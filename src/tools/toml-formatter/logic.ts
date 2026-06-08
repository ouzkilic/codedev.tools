import type { ToolLogic } from '@/hooks/useToolState';
import { parse, stringify } from 'smol-toml';

export const tomlFormatterLogic: ToolLogic = {
  transform(input) {
    try {
      return stringify(parse(input));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Invalid TOML', { cause: e });
    }
  },
};

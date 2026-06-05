import { stringify } from 'smol-toml';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToTomlLogic: ToolLogic = {
  transform(input: string): string {
    const data = JSON.parse(input);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('TOML requires a top-level JSON object.');
    }
    return stringify(data);
  },
};

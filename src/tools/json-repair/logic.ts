import { jsonrepair } from 'jsonrepair';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonRepairLogic: ToolLogic = {
  transform(input: string): string {
    // jsonrepair fixes common mistakes (unquoted keys, trailing commas, single
    // quotes, etc.); we then pretty-print the result.
    return JSON.stringify(JSON.parse(jsonrepair(input)), null, 2);
  },
};

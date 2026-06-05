import cronstrue from 'cronstrue';
import type { ToolLogic } from '@/hooks/useToolState';

export const cronLogic: ToolLogic = {
  transform(input: string): string {
    // cronstrue throws on invalid expressions — surfaced as the error banner.
    return cronstrue.toString(input.trim(), { throwExceptionOnParseError: true });
  },
};

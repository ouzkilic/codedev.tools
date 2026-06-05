import { md5 } from 'js-md5';
import type { ToolLogic } from '@/hooks/useToolState';

// MD5 isn't available in the Web Crypto API, so we use a small pure-JS implementation.
export const md5Logic: ToolLogic = {
  transform(input: string): string {
    return md5(input);
  },
};

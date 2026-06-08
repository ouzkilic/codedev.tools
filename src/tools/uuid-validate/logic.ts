import type { ToolLogic } from '@/hooks/useToolState';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const uuidValidateLogic: ToolLogic = {
  transform(input: string): string {
    const id = input.trim();
    if (!UUID_RE.test(id)) {
      throw new Error('Not a valid UUID.');
    }
    return 'Valid UUID\nVersion: ' + id[14];
  },
};

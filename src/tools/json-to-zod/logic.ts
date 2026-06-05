import { jsonToZod } from 'json-to-zod';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonToZodLogic: ToolLogic = {
  transform(input: string): string {
    const schema = jsonToZod(JSON.parse(input), 'schema');
    // json-to-zod output references `z` but omits the import — add it.
    return `import { z } from "zod";\n\n${schema}\n`;
  },
};

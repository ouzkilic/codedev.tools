import Ajv from 'ajv';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonValidateLogic: ToolLogic = {
  secondary: {
    label: 'JSON Schema (optional)',
    placeholder: '{ "type": "object", "required": ["id"] }',
  },
  transform(input: string, ctx): string {
    const data = JSON.parse(input); // invalid JSON → surfaced as an error

    const schemaText = ctx?.secondary?.trim();
    if (!schemaText) return '✓ Valid JSON (no schema provided).';

    const schema = JSON.parse(schemaText);
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);

    if (validate(data)) return '✓ Valid — data matches the schema.';

    const errors = (validate.errors ?? [])
      .map((e) => `• ${e.instancePath || '(root)'} ${e.message}`)
      .join('\n');
    return `✗ Invalid:\n${errors}`;
  },
};

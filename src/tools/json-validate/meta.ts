import { ShieldCheck } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-validate',
  title: 'JSON Validator',
  description: 'Validates JSON syntax and optionally checks it against a JSON Schema.',
  category: 'json',
  keywords: ['json', 'validate', 'schema', 'lint', 'check', 'ajv'],
  icon: ShieldCheck,
  load: () => import('./index'),
};

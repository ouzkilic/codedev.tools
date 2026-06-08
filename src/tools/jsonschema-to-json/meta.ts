import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'jsonschema-to-json',
  title: 'JSON Schema → Sample',
  description: 'Generates a sample JSON instance from a JSON Schema.',
  category: 'schema',
  keywords: ['json schema', 'sample', 'mock', 'example', 'instance'],
  icon: Shield,
  load: () => import('./index'),
};

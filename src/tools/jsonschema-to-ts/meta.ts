import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'jsonschema-to-ts',
  title: 'JSON Schema → TypeScript',
  description: 'Generates TypeScript interfaces from a JSON Schema.',
  category: 'schema',
  keywords: ['json schema', 'typescript', 'interface', 'types', 'convert'],
  icon: Shield,
  load: () => import('./index'),
};

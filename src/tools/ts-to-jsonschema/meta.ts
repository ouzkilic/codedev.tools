import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ts-to-jsonschema',
  title: 'TypeScript → JSON Schema',
  description: 'Generates a JSON Schema from a simple TypeScript interface.',
  category: 'schema',
  keywords: ['typescript', 'json schema', 'interface', 'convert', 'types'],
  icon: Shield,
  load: () => import('./index'),
};

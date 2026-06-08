import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'zod-to-jsonschema',
  title: 'Zod → JSON Schema',
  description: 'Infers a JSON Schema from a Zod object schema.',
  category: 'schema',
  keywords: ['zod', 'json schema', 'convert', 'validation'],
  icon: Shield,
  load: () => import('./index'),
};

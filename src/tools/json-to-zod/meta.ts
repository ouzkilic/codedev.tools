import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-zod',
  title: 'JSON → Zod',
  description: 'Generates a Zod schema from JSON data.',
  category: 'schema',
  keywords: ['zod', 'schema', 'type', 'validation', 'json'],
  icon: Shield,
  load: () => import('./index'),
};

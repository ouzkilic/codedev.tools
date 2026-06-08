import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ts-to-zod',
  title: 'TypeScript → Zod',
  description: 'Generates a Zod schema from a simple TypeScript interface.',
  category: 'schema',
  keywords: ['typescript', 'zod', 'schema', 'interface', 'validation'],
  icon: Shield,
  load: () => import('./index'),
};

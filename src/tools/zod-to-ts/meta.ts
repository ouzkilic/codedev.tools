import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'zod-to-ts',
  title: 'Zod → TypeScript',
  description: 'Infers a TypeScript interface from a Zod object schema.',
  category: 'schema',
  keywords: ['zod', 'typescript', 'interface', 'types', 'convert'],
  icon: Shield,
  load: () => import('./index'),
};

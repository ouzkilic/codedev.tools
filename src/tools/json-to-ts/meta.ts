import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-ts',
  title: 'JSON → TypeScript',
  description: 'Generates TypeScript interfaces from a JSON sample.',
  category: 'schema',
  keywords: ['json', 'typescript', 'ts', 'interface', 'type', 'types'],
  icon: Shield,
  load: () => import('./index'),
};

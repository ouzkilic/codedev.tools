import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-graphql',
  title: 'JSON → GraphQL Type',
  description: 'Infers GraphQL type definitions from a JSON sample.',
  category: 'schema',
  keywords: ['json', 'graphql', 'type', 'schema', 'infer'],
  icon: Shield,
  load: () => import('./index'),
};

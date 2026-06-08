import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'entity-reference',
  title: 'HTML Entities Reference',
  description: 'Searchable list of HTML named entities.',
  category: 'misc',
  keywords: ['html', 'entities', 'reference', 'named', 'char'],
  icon: Code2,
  load: () => import('./index'),
};

import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-sort',
  title: 'JSON Sort Keys',
  description: 'Recursively sorts JSON object keys alphabetically.',
  category: 'json',
  keywords: ['json', 'sort', 'keys', 'alphabetical', 'order'],
  icon: Braces,
  load: () => import('./index'),
};

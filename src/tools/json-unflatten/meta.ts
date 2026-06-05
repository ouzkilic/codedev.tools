import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-unflatten',
  title: 'JSON Unflatten',
  description: 'Rebuilds nested JSON from flat dot/bracket path keys.',
  category: 'json',
  keywords: ['json', 'unflatten', 'nest', 'dot', 'path', 'expand'],
  icon: Braces,
  load: () => import('./index'),
};

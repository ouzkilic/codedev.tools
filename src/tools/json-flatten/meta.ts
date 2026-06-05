import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-flatten',
  title: 'JSON Flatten',
  description: 'Flattens nested JSON into single-level dot/bracket paths.',
  category: 'json',
  keywords: ['json', 'flatten', 'dot', 'path', 'nested', 'unnest'],
  icon: Braces,
  load: () => import('./index'),
};

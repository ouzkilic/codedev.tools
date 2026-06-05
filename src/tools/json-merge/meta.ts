import { Combine } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-merge',
  title: 'JSON Merge',
  description: 'Deep-merges two JSON objects (source overrides target).',
  category: 'json',
  keywords: ['json', 'merge', 'combine', 'deep', 'patch', 'assign'],
  icon: Combine,
  load: () => import('./index'),
};

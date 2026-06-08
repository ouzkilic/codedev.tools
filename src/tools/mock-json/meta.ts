import { Sparkles } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'mock-json',
  title: 'Mock JSON from Schema',
  description: 'Generates random mock JSON from a JSON Schema.',
  category: 'schema',
  keywords: ['mock', 'json', 'schema', 'fake', 'random', 'sample'],
  icon: Sparkles,
  load: () => import('./index'),
};

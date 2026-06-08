import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-types',
  title: 'JSON → Types (multi-language)',
  description: 'Generates types for many languages from JSON (via quicktype).',
  category: 'schema',
  keywords: ['json', 'types', 'go', 'rust', 'java', 'python', 'quicktype', 'convert'],
  icon: Shield,
  load: () => import('./index'),
};

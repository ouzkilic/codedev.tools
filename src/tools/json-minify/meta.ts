import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-minify',
  title: 'JSON Minify',
  description: 'Compresses JSON by removing all unnecessary whitespace.',
  category: 'json',
  keywords: ['json', 'minify', 'compress', 'compact', 'whitespace'],
  icon: Braces,
  load: () => import('./index'),
};

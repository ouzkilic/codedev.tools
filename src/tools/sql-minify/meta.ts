import { Database } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'sql-minify',
  title: 'SQL Minify',
  description: 'Minifies SQL by removing comments and extra whitespace.',
  category: 'format',
  keywords: ['sql', 'minify', 'compress', 'comments'],
  icon: Database,
  load: () => import('./index'),
};

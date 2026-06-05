import { Database } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'sql-formatter',
  title: 'SQL Formatter',
  description: 'Formats and indents SQL queries (multiple dialects).',
  category: 'format',
  keywords: ['sql', 'format', 'beautify', 'query', 'pretty'],
  icon: Database,
  load: () => import('./index'),
};

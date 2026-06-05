import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-csv',
  title: 'JSON → CSV',
  description: 'Converts a JSON array of objects into CSV.',
  category: 'csv-excel',
  keywords: ['json', 'csv', 'convert', 'export', 'table'],
  icon: Table2,
  load: () => import('./index'),
};

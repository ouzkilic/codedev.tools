import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-to-json',
  title: 'CSV → JSON',
  description: 'Converts CSV (with a header row) into a JSON array of objects.',
  category: 'csv-excel',
  keywords: ['csv', 'json', 'convert', 'parse', 'table'],
  icon: Table2,
  load: () => import('./index'),
};

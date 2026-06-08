import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'csv-to-xml',
  title: 'CSV → XML',
  description: 'Converts CSV (with header) into XML rows.',
  category: 'csv-excel',
  keywords: ['csv', 'xml', 'convert', 'rows'],
  icon: Table2,
  load: () => import('./index'),
};

import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-tsv',
  title: 'CSV ↔ TSV',
  description: 'Converts between comma- and tab-separated values.',
  category: 'csv-excel',
  keywords: ['csv', 'tsv', 'tab', 'convert', 'delimiter'],
  icon: Table2,
  load: () => import('./index'),
};

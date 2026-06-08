import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-transpose',
  title: 'CSV Transpose',
  description: 'Swaps rows and columns of a CSV.',
  category: 'csv-excel',
  keywords: ['csv', 'transpose', 'rows', 'columns', 'pivot'],
  icon: Table2,
  load: () => import('./index'),
};

import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'csv-to-html', title: 'CSV → HTML Table', description: 'Converts CSV into an HTML table.', category: 'csv-excel',
  keywords: ['csv', 'html', 'table', 'convert'], icon: Table2, load: () => import('./index'),
};

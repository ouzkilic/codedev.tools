import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'csv-viewer', title: 'CSV → Table', description: 'Renders CSV as an aligned monospace table.', category: 'csv-excel',
  keywords: ['csv', 'table', 'viewer', 'align', 'format'], icon: Table2, load: () => import('./index'),
};

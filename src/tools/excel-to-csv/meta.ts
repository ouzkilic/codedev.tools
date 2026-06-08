import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'excel-to-csv',
  title: 'Excel → CSV',
  description: 'Converts the first sheet of an Excel file to CSV.',
  category: 'csv-excel',
  keywords: ['excel', 'xlsx', 'xls', 'csv', 'convert', 'spreadsheet'],
  icon: Table2,
  load: () => import('./index'),
};

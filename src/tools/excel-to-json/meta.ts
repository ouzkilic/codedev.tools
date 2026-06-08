import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'excel-to-json',
  title: 'Excel → JSON',
  description: 'Converts the first sheet of an Excel file to JSON.',
  category: 'csv-excel',
  keywords: ['excel', 'xlsx', 'xls', 'json', 'convert', 'spreadsheet'],
  icon: Table2,
  load: () => import('./index'),
};

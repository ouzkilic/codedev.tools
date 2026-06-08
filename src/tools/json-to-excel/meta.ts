import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-excel',
  title: 'JSON → Excel',
  description: 'Converts a JSON array of objects into a downloadable .xlsx file.',
  category: 'csv-excel',
  keywords: ['json', 'excel', 'xlsx', 'spreadsheet', 'convert', 'download'],
  icon: Table2,
  load: () => import('./index'),
};

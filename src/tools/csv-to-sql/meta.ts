import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-to-sql',
  title: 'CSV → SQL Insert',
  description: 'Generates SQL INSERT statements from CSV rows.',
  category: 'csv-excel',
  keywords: ['csv', 'sql', 'insert', 'convert', 'database'],
  icon: Table2,
  load: () => import('./index'),
};

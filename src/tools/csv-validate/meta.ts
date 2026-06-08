import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-validate',
  title: 'CSV Validator',
  description: 'Validates CSV and reports row/column counts.',
  category: 'csv-excel',
  keywords: ['csv', 'validate', 'lint', 'check', 'rows'],
  icon: Table2,
  load: () => import('./index'),
};

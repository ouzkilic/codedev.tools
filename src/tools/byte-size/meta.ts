import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'byte-size',
  title: 'Byte Size Converter',
  description: 'Converts byte counts to KB/MB/GB (decimal and binary).',
  category: 'number',
  keywords: ['byte', 'size', 'kb', 'mb', 'gb', 'kib', 'mib', 'humanize'],
  icon: Hash,
  load: () => import('./index'),
};

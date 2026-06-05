import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'mime-types',
  title: 'MIME Types',
  description: 'Looks up MIME types by file extension or vice versa.',
  category: 'misc',
  keywords: ['mime', 'content-type', 'extension', 'media', 'reference'],
  icon: FileText,
  load: () => import('./index'),
};

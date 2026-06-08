import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'gitignore',
  title: '.gitignore Generator',
  description: 'Generates a .gitignore for common stacks.',
  category: 'misc',
  keywords: ['gitignore', 'git', 'template', 'ignore'],
  icon: FileText,
  load: () => import('./index'),
};

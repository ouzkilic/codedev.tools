import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'css-minify',
  title: 'CSS Minify',
  description: 'Minifies CSS by removing comments and unneeded whitespace.',
  category: 'web',
  keywords: ['css', 'minify', 'compress', 'whitespace'],
  icon: Code2,
  load: () => import('./index'),
};

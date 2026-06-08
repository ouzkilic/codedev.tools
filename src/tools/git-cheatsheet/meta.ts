import { Boxes } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'git-cheatsheet',
  title: 'Git Cheatsheet',
  description: 'Common git commands reference.',
  category: 'misc',
  keywords: ['git', 'cheatsheet', 'commands', 'reference', 'vcs'],
  icon: Boxes,
  load: () => import('./index'),
};

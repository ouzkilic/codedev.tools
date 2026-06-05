import { ListTree } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-viewer',
  title: 'JSON Tree Viewer',
  description: 'Explore JSON as a collapsible, navigable tree.',
  category: 'json',
  keywords: ['json', 'viewer', 'tree', 'explore', 'collapse', 'inspect'],
  icon: ListTree,
  load: () => import('./index'),
};

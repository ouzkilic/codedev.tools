import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-strip',
  title: 'Strip HTML Tags',
  description: 'Removes HTML tags and decodes basic entities to plain text.',
  category: 'text',
  keywords: ['html', 'strip', 'tags', 'plain', 'text', 'remove'],
  icon: Type,
  load: () => import('./index'),
};

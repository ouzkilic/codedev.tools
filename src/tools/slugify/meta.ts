import { Link2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'slugify',
  title: 'Slugify',
  description: 'Turns text into a URL-friendly slug (handles accents & Turkish).',
  category: 'text',
  keywords: ['slug', 'slugify', 'url', 'permalink', 'kebab', 'seo'],
  icon: Link2,
  load: () => import('./index'),
};

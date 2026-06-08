import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'meta-tags',
  title: 'Meta Tag Generator',
  description: 'Generates HTML meta and Open Graph tags.',
  category: 'web',
  keywords: ['meta', 'og', 'open graph', 'seo', 'tags', 'head'],
  icon: Globe,
  load: () => import('./index'),
};

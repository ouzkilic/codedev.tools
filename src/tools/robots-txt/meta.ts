import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'robots-txt',
  title: 'robots.txt Generator',
  description: 'Generates a robots.txt file.',
  category: 'web',
  keywords: ['robots', 'robots.txt', 'seo', 'crawler', 'sitemap'],
  icon: Globe,
  load: () => import('./index'),
};

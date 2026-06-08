import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ascii-art',
  title: 'ASCII Art (Figlet)',
  description: 'Renders text as ASCII art banners.',
  category: 'text',
  keywords: ['ascii', 'art', 'figlet', 'banner', 'text'],
  icon: Type,
  load: () => import('./index'),
};

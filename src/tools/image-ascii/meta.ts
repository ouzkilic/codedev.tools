import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'image-ascii',
  title: 'Image to ASCII',
  description: 'Converts an image into ASCII art.',
  category: 'image',
  keywords: ['image', 'ascii', 'art', 'text', 'convert'],
  icon: Type,
  load: () => import('./index'),
};

import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'favicon',
  title: 'Favicon Generator',
  description: 'Generates favicon PNGs at standard sizes from an image.',
  category: 'image',
  keywords: ['favicon', 'icon', 'png', 'generate', 'sizes'],
  icon: Image,
  load: () => import('./index'),
};

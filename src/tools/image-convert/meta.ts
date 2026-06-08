import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'image-convert',
  title: 'Image Format Converter',
  description: 'Converts an image between PNG, JPEG and WebP.',
  category: 'image',
  keywords: ['image', 'convert', 'png', 'jpeg', 'webp', 'format'],
  icon: Image,
  load: () => import('./index'),
};

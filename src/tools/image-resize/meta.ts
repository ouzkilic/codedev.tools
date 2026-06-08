import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'image-resize',
  title: 'Image Resize',
  description: 'Resizes an image to given dimensions (optionally keeping aspect ratio).',
  category: 'image',
  keywords: ['image', 'resize', 'scale', 'dimensions', 'compress'],
  icon: Image,
  load: () => import('./index'),
};

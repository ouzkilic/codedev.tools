import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'exif',
  title: 'EXIF Viewer',
  description: 'Reads EXIF metadata from a photo.',
  category: 'image',
  keywords: ['exif', 'metadata', 'photo', 'image', 'viewer'],
  icon: Image,
  load: () => import('./index'),
};

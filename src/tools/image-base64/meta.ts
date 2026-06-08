import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'image-base64',
  title: 'Image → Base64',
  description: 'Converts an image (or any file) into a Base64 data URI.',
  category: 'image',
  keywords: ['image', 'base64', 'data uri', 'datauri', 'encode', 'file'],
  icon: Image,
  load: () => import('./index'),
};

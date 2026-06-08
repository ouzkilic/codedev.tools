import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'image-colors',
  title: 'Image Color Extractor',
  description: 'Extracts a dominant color palette from an image.',
  category: 'image',
  keywords: ['image', 'color', 'palette', 'extract', 'dominant'],
  icon: Palette,
  load: () => import('./index'),
};

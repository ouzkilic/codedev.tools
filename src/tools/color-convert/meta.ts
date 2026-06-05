import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'color-convert',
  title: 'Color Converter',
  description: 'Converts colors between HEX, RGB and HSL.',
  category: 'color',
  keywords: ['color', 'hex', 'rgb', 'hsl', 'convert', 'css'],
  icon: Palette,
  load: () => import('./index'),
};

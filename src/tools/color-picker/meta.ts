import { Pipette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'color-picker',
  title: 'Color Picker',
  description: 'Pick a color and read its HEX, RGB and HSL values.',
  category: 'color',
  keywords: ['color', 'picker', 'hex', 'rgb', 'hsl', 'eyedropper'],
  icon: Pipette,
  load: () => import('./index'),
};

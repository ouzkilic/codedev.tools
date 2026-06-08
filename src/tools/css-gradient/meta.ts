import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'css-gradient',
  title: 'CSS Gradient Generator',
  description: 'Builds a CSS linear or radial gradient with a live preview.',
  category: 'color',
  keywords: ['css', 'gradient', 'linear', 'radial', 'background', 'generate'],
  icon: Palette,
  load: () => import('./index'),
};

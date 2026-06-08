import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'color-palette',
  title: 'Color Palette',
  description: 'Generates a list of random hex colors.',
  category: 'color',
  keywords: ['color', 'palette', 'random', 'hex', 'swatch'],
  icon: Palette,
  load: () => import('./index'),
};

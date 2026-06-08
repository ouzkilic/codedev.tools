import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'box-shadow',
  title: 'Box Shadow Generator',
  description: 'Builds a CSS box-shadow with a live preview.',
  category: 'color',
  keywords: ['css', 'box-shadow', 'shadow', 'generate', 'preview'],
  icon: Palette,
  load: () => import('./index'),
};

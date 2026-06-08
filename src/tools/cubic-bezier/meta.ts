import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cubic-bezier',
  title: 'Cubic Bezier',
  description: 'Builds a CSS cubic-bezier timing function.',
  category: 'color',
  keywords: ['cubic-bezier', 'easing', 'timing', 'animation', 'css'],
  icon: Palette,
  load: () => import('./index'),
};

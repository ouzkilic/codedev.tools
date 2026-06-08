import { Palette } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'contrast',
  title: 'Contrast Checker',
  description: 'Checks WCAG contrast ratio between two colors.',
  category: 'color',
  keywords: ['contrast', 'wcag', 'accessibility', 'a11y', 'color', 'ratio'],
  icon: Palette,
  load: () => import('./index'),
};

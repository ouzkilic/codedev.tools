import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'aspect-ratio',
  title: 'Aspect Ratio',
  description: 'Simplifies a width×height into an aspect ratio.',
  category: 'number',
  keywords: ['aspect', 'ratio', 'resolution', 'width', 'height'],
  icon: Hash,
  load: () => import('./index'),
};

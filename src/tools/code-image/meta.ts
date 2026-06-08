import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'code-image',
  title: 'Code → Image',
  description: 'Renders a code snippet to a downloadable PNG.',
  category: 'web',
  keywords: ['code', 'image', 'png', 'screenshot', 'carbon', 'snippet'],
  icon: Image,
  load: () => import('./index'),
};

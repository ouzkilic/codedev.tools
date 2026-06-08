import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'pad-truncate',
  title: 'Pad / Truncate Lines',
  description: 'Pads or truncates each line to a fixed width.',
  category: 'text',
  keywords: ['pad', 'truncate', 'align', 'width', 'fixed'],
  icon: Type,
  load: () => import('./index'),
};

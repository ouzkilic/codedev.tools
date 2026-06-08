import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'leetspeak',
  title: 'Leetspeak',
  description: 'Converts text to and from basic leetspeak.',
  category: 'text',
  keywords: ['leet', 'leetspeak', '1337', 'fun', 'convert'],
  icon: Type,
  load: () => import('./index'),
};

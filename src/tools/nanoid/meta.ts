import { Dices } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'nanoid',
  title: 'NanoID Generator',
  description: 'Generates compact, URL-safe random IDs.',
  category: 'generate',
  keywords: ['nanoid', 'id', 'random', 'url-safe', 'short', 'generate'],
  icon: Dices,
  load: () => import('./index'),
};

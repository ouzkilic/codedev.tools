import { Dices } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'random',
  title: 'Random Generator',
  description: 'Generates random numbers, strings or hex.',
  category: 'generate',
  keywords: ['random', 'number', 'string', 'hex', 'generate'],
  icon: Dices,
  load: () => import('./index'),
};

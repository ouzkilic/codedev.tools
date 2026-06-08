import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'unit-convert',
  title: 'Unit Converter',
  description: 'Converts length, mass and temperature units.',
  category: 'number',
  keywords: ['unit', 'convert', 'length', 'weight', 'mass', 'temperature'],
  icon: Hash,
  load: () => import('./index'),
};

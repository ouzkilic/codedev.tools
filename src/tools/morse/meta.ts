import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'morse', title: 'Morse Code', description: 'Converts text to and from Morse code.', category: 'text',
  keywords: ['morse', 'code', 'encode', 'decode', 'telegraph'], icon: Type, load: () => import('./index'),
};

import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'keycode', title: 'Keyboard Keycode', description: 'Shows the JS keyCode for a key.', category: 'misc',
  keywords: ['keycode', 'key', 'keyboard', 'event', 'code'], icon: Type, load: () => import('./index'),
};

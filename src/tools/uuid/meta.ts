import { Fingerprint } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'uuid',
  title: 'UUID Generator',
  description: 'Generates random v4 UUIDs.',
  category: 'generate',
  keywords: ['uuid', 'guid', 'id', 'random', 'v4', 'generate'],
  icon: Fingerprint,
  load: () => import('./index'),
};

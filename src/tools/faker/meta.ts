import { Sparkles } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'faker',
  title: 'Fake Data Generator',
  description: 'Generates fake names, emails, addresses and more.',
  category: 'generate',
  keywords: ['fake', 'faker', 'mock', 'dummy', 'test data', 'random'],
  icon: Sparkles,
  load: () => import('./index'),
};

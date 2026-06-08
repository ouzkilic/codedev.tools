import { Sparkles } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'emoji',
  title: 'Emoji Picker',
  description: 'Search common emojis by name.',
  category: 'misc',
  keywords: ['emoji', 'picker', 'search', 'unicode', 'smiley'],
  icon: Sparkles,
  load: () => import('./index'),
};

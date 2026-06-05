import { Pilcrow } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'lorem',
  title: 'Lorem Ipsum',
  description: 'Generates placeholder text by words, sentences or paragraphs.',
  category: 'generate',
  keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text', 'filler'],
  icon: Pilcrow,
  load: () => import('./index'),
};

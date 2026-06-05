import { Quote } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-escape',
  title: 'JSON Escape / Unescape',
  description: 'Escapes text into a JSON string literal, or unescapes it back.',
  category: 'json',
  keywords: ['json', 'escape', 'unescape', 'string', 'quote', 'stringify'],
  icon: Quote,
  load: () => import('./index'),
};

import { CaseSensitive } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'text-case',
  title: 'Case Converter',
  description: 'Converts text between camelCase, snake_case, kebab-case and more.',
  category: 'text',
  keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', 'title', 'upper', 'lower'],
  icon: CaseSensitive,
  load: () => import('./index'),
};

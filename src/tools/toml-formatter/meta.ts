import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'toml-formatter',
  title: 'TOML Formatter',
  description: 'Validates and reformats TOML.',
  category: 'yaml',
  keywords: ['toml', 'format', 'validate', 'beautify', 'config'],
  icon: FileText,
  load: () => import('./index'),
};

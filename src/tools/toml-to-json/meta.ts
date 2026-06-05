import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'toml-to-json',
  title: 'TOML → JSON',
  description: 'Converts TOML configuration into JSON.',
  category: 'yaml',
  keywords: ['toml', 'json', 'convert', 'config', 'parse'],
  icon: FileText,
  load: () => import('./index'),
};

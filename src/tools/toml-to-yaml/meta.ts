import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'toml-to-yaml',
  title: 'TOML → YAML',
  description: 'Converts TOML into YAML.',
  category: 'yaml',
  keywords: ['toml', 'yaml', 'convert', 'config'],
  icon: FileText,
  load: () => import('./index'),
};

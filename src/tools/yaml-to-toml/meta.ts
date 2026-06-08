import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'yaml-to-toml',
  title: 'YAML → TOML',
  description: 'Converts YAML into TOML.',
  category: 'yaml',
  keywords: ['yaml', 'toml', 'convert', 'config'],
  icon: FileText,
  load: () => import('./index'),
};

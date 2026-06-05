import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-toml',
  title: 'JSON → TOML',
  description: 'Converts a JSON object into TOML.',
  category: 'yaml',
  keywords: ['json', 'toml', 'convert', 'config', 'stringify'],
  icon: FileText,
  load: () => import('./index'),
};

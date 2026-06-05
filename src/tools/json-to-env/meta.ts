import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-env',
  title: 'JSON → .env',
  description: 'Converts a flat JSON object into .env format.',
  category: 'misc',
  keywords: ['json', 'env', 'dotenv', 'convert', 'config', 'environment'],
  icon: FileText,
  load: () => import('./index'),
};

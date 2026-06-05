import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'env-to-json',
  title: '.env → JSON',
  description: 'Converts a .env file into a JSON object.',
  category: 'misc',
  keywords: ['env', 'dotenv', 'json', 'convert', 'config', 'environment'],
  icon: FileText,
  load: () => import('./index'),
};

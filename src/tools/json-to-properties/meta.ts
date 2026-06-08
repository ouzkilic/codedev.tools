import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-properties',
  title: 'JSON → .properties',
  description: 'Converts a JSON object into Java .properties (nested keys dotted).',
  category: 'misc',
  keywords: ['json', 'properties', 'java', 'convert', 'config'],
  icon: FileText,
  load: () => import('./index'),
};

import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'properties-to-json',
  title: '.properties → JSON',
  description: 'Converts a Java .properties file into JSON.',
  category: 'misc',
  keywords: ['properties', 'java', 'json', 'convert', 'config'],
  icon: FileText,
  load: () => import('./index'),
};

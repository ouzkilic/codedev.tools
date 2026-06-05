import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-formatter',
  title: 'JSON Formatter',
  description: 'Pretty-prints JSON with readable indentation.',
  category: 'json',
  keywords: ['json', 'format', 'beautify', 'pretty', 'indent'],
  icon: Braces,
  load: () => import('./index'),
};

import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-jsonl',
  title: 'JSON → JSONL',
  description: 'Converts a JSON array to newline-delimited JSON (NDJSON).',
  category: 'json',
  keywords: ['json', 'jsonl', 'ndjson', 'lines', 'newline', 'array'],
  icon: Braces,
  load: () => import('./index'),
};

import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'jsonl-to-json',
  title: 'JSONL → JSON',
  description: 'Converts newline-delimited JSON (NDJSON) into a JSON array.',
  category: 'json',
  keywords: ['jsonl', 'ndjson', 'json', 'lines', 'array', 'parse'],
  icon: Braces,
  load: () => import('./index'),
};

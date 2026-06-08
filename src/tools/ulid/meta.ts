import { Fingerprint } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ulid',
  title: 'ULID Generator',
  description: 'Generates sortable, timestamp-based unique IDs (ULID).',
  category: 'generate',
  keywords: ['ulid', 'id', 'sortable', 'unique', 'timestamp', 'generate'],
  icon: Fingerprint,
  load: () => import('./index'),
};

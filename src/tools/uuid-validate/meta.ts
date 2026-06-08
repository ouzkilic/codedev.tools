import { Fingerprint } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'uuid-validate',
  title: 'UUID Validator',
  description: 'Validates a UUID and reports its version.',
  category: 'misc',
  keywords: ['uuid', 'guid', 'validate', 'version', 'check'],
  icon: Fingerprint,
  load: () => import('./index'),
};

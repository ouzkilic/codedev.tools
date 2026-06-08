import { Braces } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-patch',
  title: 'JSON Patch (RFC 6902)',
  description: 'Applies an RFC 6902 JSON Patch to a JSON document.',
  category: 'json',
  keywords: ['json', 'patch', 'rfc6902', 'diff', 'apply'],
  icon: Braces,
  load: () => import('./index'),
};

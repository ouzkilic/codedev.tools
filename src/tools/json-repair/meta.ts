import { Wrench } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-repair',
  title: 'JSON Repair',
  description: 'Fixes broken JSON: unquoted keys, trailing commas, single quotes.',
  category: 'json',
  keywords: ['json', 'repair', 'fix', 'broken', 'invalid', 'recover'],
  icon: Wrench,
  load: () => import('./index'),
};

import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-jsonschema',
  title: 'JSON → JSON Schema',
  description: 'Infers a JSON Schema (draft-07) from a JSON sample.',
  category: 'schema',
  keywords: ['json', 'schema', 'json-schema', 'draft-07', 'infer', 'validate'],
  icon: Shield,
  load: () => import('./index'),
};

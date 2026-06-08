import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-proto',
  title: 'JSON → Protobuf',
  description: 'Infers a proto3 message from a JSON sample.',
  category: 'schema',
  keywords: ['json', 'protobuf', 'proto', 'message', 'schema'],
  icon: Shield,
  load: () => import('./index'),
};

import { Shield } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'openapi-to-ts',
  title: 'OpenAPI → TypeScript',
  description: 'Generates TypeScript interfaces from an OpenAPI/Swagger spec.',
  category: 'schema',
  keywords: ['openapi', 'swagger', 'typescript', 'types', 'interface'],
  icon: Shield,
  load: () => import('./index'),
};

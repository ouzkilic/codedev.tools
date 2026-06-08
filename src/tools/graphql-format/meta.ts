import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'graphql-format',
  title: 'GraphQL Formatter',
  description: 'Formats a GraphQL query or schema.',
  category: 'format',
  keywords: ['graphql', 'format', 'beautify', 'gql', 'pretty'],
  icon: Code2,
  load: () => import('./index'),
};
